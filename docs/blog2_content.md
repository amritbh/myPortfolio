In my [previous post](/blogs/how-i-built-a-serverless-portfolio-on-aws), I walked through how the frontend of this portfolio is hosted on AWS using S3, CloudFront, and Route53. Today, let's go deeper — into the **backend** that powers the blog engine you are reading this on right now.

Every blog post, every like, every comment you see on this site is read from and written to a real database through a real REST API. And the entire thing runs on **AWS Lambda + API Gateway + DynamoDB**, with zero servers to manage.

In this post, I'll show you exactly how I designed and built it — including the DynamoDB table schema, the Lambda function structure, the API Gateway configuration, and the IAM roles that tie it all together.

---

## The Architecture

Here is how a request flows from your browser to the database and back:

```
Browser
  |
  v
API Gateway (HTTP API)
  |
  v
Lambda Function (Python)
  |
  +---> DynamoDB (blogs, comments, likes)
  |
  +---> Cognito (JWT auth verification)
  |
  +---> SES (email notifications)
```

Every HTTP request hits **API Gateway**, which triggers a single **Lambda function** acting as a router. The Lambda reads the path and method, calls the appropriate handler, and returns a response. **DynamoDB** stores all data on-demand, with no servers or capacity planning required.

---

## Step 1: DynamoDB Table Design

DynamoDB is a NoSQL key-value store. Unlike a relational database, you design your tables around your **access patterns**, not a normalized schema. I use two tables:

**Blogs Table** (`amrit-portfolio-prod-blogs`)

```hcl
resource "aws_dynamodb_table" "blogs_table" {
  name         = "${var.prefix}-blogs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "slug"

  attribute {
    name = "slug"
    type = "S"
  }

  tags = {
    Environment = var.environment
  }
}
```

Each blog post is identified by its **slug** (e.g., `how-i-built-a-serverless-portfolio-on-aws`). The item stores everything in a single row:

```json
{
  "slug": "how-i-built-a-serverless-api",
  "title": "Building a Serverless REST API...",
  "content": "...",
  "tags": ["AWS", "Lambda", "DynamoDB"],
  "publishDate": "2026-07-28T00:00:00Z",
  "likes": ["user1@example.com", "user2@example.com"],
  "comments": [
    {
      "id": "abc123",
      "username": "Jay Bhole",
      "text": "Great post!",
      "createdAt": "2026-07-28T12:00:00Z"
    }
  ]
}
```

> **Why `PAY_PER_REQUEST`?** With on-demand billing, you pay only for the read/write operations you actually use. For a low-traffic portfolio, this costs essentially nothing — typically under \$0.10/month.

---

## Step 2: Lambda Function — One Function, All Routes

Instead of creating a separate Lambda for each endpoint (which means more infrastructure to manage), I use a **single Lambda function as a router**. The function reads `rawPath` and the HTTP method to decide what to do.

```python
def lambda_handler(event, context):
    print("EVENT:", json.dumps(event))
    path    = event.get('rawPath', '')
    method  = event.get('requestContext', {}).get('http', {}).get('method', 'GET')

    # Strip trailing slashes
    if path.endswith('/') and len(path) > 1:
        path = path[:-1]

    # --- Blog routes ---
    if path == '/blogs':
        if method == 'POST':
            return create_blog(event)
        return get_all_blogs()

    elif path.startswith('/blogs/'):
        parts = path.split('/')
        slug  = parts[2] if len(parts) > 2 else ''

        if len(parts) == 4 and parts[3] == 'comment':
            if method == 'POST':
                return comment_blog(event, slug)
            if method == 'DELETE':
                return delete_comment(event, slug)

        if len(parts) == 4 and parts[3] == 'like' and method == 'POST':
            return like_blog(event, slug)

        if len(parts) == 3:
            if method == 'PUT':
                return update_blog(event, slug)
            if method == 'DELETE':
                return delete_blog(event, slug)

        return get_blog_by_slug(slug)

    return {'statusCode': 404, 'body': json.dumps({'error': 'Not found'})}
```

This pattern keeps the infrastructure simple — one function, one deployment, one log group — while the routing logic lives cleanly in Python.

---

## Step 3: CRUD Handlers

Let's look at the two most important handlers: fetching all blogs and creating a comment.

### `get_all_blogs()` — Reading from DynamoDB

```python
def get_all_blogs():
    try:
        response = table.scan()
        blogs = response.get('Items', [])

        # Sort by publishDate descending
        blogs.sort(
            key=lambda x: x.get('publishDate', ''),
            reverse=True
        )

        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'blogs': blogs}, default=decimal_serializer)
        }
    except Exception as e:
        print(f"Error fetching blogs: {e}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': 'Internal server error'})
        }
```

> **`decimal_serializer`**: DynamoDB returns numbers as Python `Decimal` types, which the default `json.dumps` cannot serialize. A small helper converts them to `int` or `float` before serializing.

### `comment_blog(event, slug)` — Writing and Authentication

Comments require authentication. The handler first verifies the JWT token from the `Authorization` header, then appends the comment to the blog's `comments` list in DynamoDB.

```python
def comment_blog(event, slug):
    try:
        # 1. Authenticate the request
        payload = authenticate(event)
        if not payload:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'})
            }

        # 2. Validate input
        text = json.loads(event.get('body', '{}')).get('text', '').strip()
        if not text:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Comment text required'})
            }

        # 3. Build comment object
        comment = {
            'id':        str(uuid.uuid4()),
            'username':  payload.get('name') or payload.get('username'),
            'picture':   payload.get('picture', ''),
            'text':      text,
            'createdAt': datetime.utcnow().isoformat()
        }

        # 4. Append to DynamoDB list (atomic update)
        table.update_item(
            Key={'slug': slug},
            UpdateExpression='SET comments = list_append(if_not_exists(comments, :empty), :c)',
            ExpressionAttributeValues={
                ':c':     [comment],
                ':empty': []
            }
        )

        return {
            'statusCode': 201,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'comment': comment})
        }
    except Exception as e:
        print(f"Error posting comment: {e}")
        return {'statusCode': 500, 'body': json.dumps({'error': 'Internal server error'})}
```

The `list_append(if_not_exists(comments, :empty), :c)` expression is a DynamoDB trick: it atomically appends to the list whether or not the `comments` attribute exists yet.

---

## Step 4: Authentication — Cognito JWT Verification

The `authenticate()` function supports two token types:

- **Custom JWTs** — issued by the Lambda itself for admin users
- **Cognito JWTs** — issued by AWS Cognito for Google Sign-In users

```python
def authenticate(event):
    headers = event.get('headers', {}) or {}
    auth    = headers.get('authorization', headers.get('Authorization', ''))
    token   = auth.replace('Bearer ', '').strip()
    if not token:
        return None

    # Try our custom JWT first (admin login)
    payload = verify_jwt(token)
    if not payload:
        # Fall back to Cognito JWT (Google Sign-In)
        payload = verify_cognito_jwt(token)
        if payload and 'error' in payload:
            print(f"Cognito auth failed: {payload['error']}")
            return None
    return payload
```

The Cognito JWT verifier fetches the **JWKS** (JSON Web Key Set) from Cognito's public endpoint and uses `python-jose` to verify the RS256 signature:

```python
def verify_cognito_jwt(token):
    try:
        user_pool_id = os.environ.get('COGNITO_USER_POOL_ID')
        region       = os.environ.get('COGNITO_REGION', 'us-east-1')
        keys_url     = f'https://cognito-idp.{region}.amazonaws.com/{user_pool_id}/.well-known/jwks.json'

        with urllib.request.urlopen(keys_url) as response:
            jwks = json.loads(response.read().decode('utf-8'))

        claims = jwt.decode(
            token, jwks,
            algorithms=['RS256'],
            options={'verify_aud': False, 'verify_at_hash': False}
        )

        email       = claims.get('email')
        admin_email = os.environ.get('ADMIN_EMAIL', '')
        role        = 'admin' if email == admin_email else 'user'

        return {
            'username': email or claims.get('cognito:username') or claims.get('sub'),
            'name':     claims.get('name') or claims.get('given_name'),
            'picture':  claims.get('picture'),
            'role':     role
        }
    except Exception as e:
        return {'error': str(e)}
```

> **Security Note:** The `verify_aud: False` option is intentional here. Cognito tokens for Google Sign-In include the Google Client ID as the audience, not our app's client ID. Disabling audience verification is safe as long as we trust the issuer (Cognito), which we verify via the JWKS endpoint.

---

## Step 5: API Gateway — HTTP API

I use the newer **HTTP API** (v2) rather than the legacy REST API (v1). HTTP APIs are cheaper, faster, and simpler:

```hcl
resource "aws_apigatewayv2_api" "api" {
  name          = "${var.prefix}-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_headers = ["Content-Type", "Authorization"]
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_origins = ["https://amrit.cloud"]
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api_lambda.invoke_arn
  integration_method = "POST"
}

# Catch-all route — Lambda handles routing internally
resource "aws_apigatewayv2_route" "default_route" {
  api_id    = aws_apigatewayv2_api.api.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default_stage" {
  api_id      = aws_apigatewayv2_api.api.id
  name        = "$default"
  auto_deploy = true
}
```

The `$default` route sends **every request** to the Lambda regardless of path or method. The Lambda then handles routing internally. This is simpler than defining a route per endpoint in Terraform.

---

## Step 6: IAM Role — Least Privilege

The Lambda function needs permission to read and write to DynamoDB. I follow the **principle of least privilege** — only the permissions it actually needs:

```hcl
resource "aws_iam_role_policy" "lambda_dynamodb_policy" {
  name = "${var.prefix}-lambda-dynamodb-policy"
  role = aws_iam_role.lambda_exec.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Scan",
          "dynamodb:Query"
        ]
        Resource = [
          aws_dynamodb_table.blogs_table.arn,
          aws_dynamodb_table.users_table.arn
        ]
      }
    ]
  })
}
```

> **Never use `dynamodb:*` in production.** Always scope down to the exact actions your function needs. This limits the blast radius if the function is ever compromised.

---

## Step 7: Packaging the Lambda

The Lambda function depends on `python-jose` for JWT verification. These dependencies need to be packaged alongside the code. Terraform handles this automatically:

```hcl
# Install dependencies into the src/ directory
resource "null_resource" "pip_install" {
  triggers = {
    requirements = filemd5("${path.module}/src/requirements.txt")
  }

  provisioner "local-exec" {
    command = "pip3 install -r ${path.module}/src/requirements.txt -t ${path.module}/src/ --upgrade"
  }
}

# Zip up the src/ directory (code + dependencies)
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/lambda_function.zip"

  depends_on = [null_resource.pip_install]
}

resource "aws_lambda_function" "api_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.prefix}-api"
  role             = aws_iam_role.lambda_exec.arn
  handler          = "app.lambda_handler"
  runtime          = "python3.12"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 30

  environment {
    variables = {
      TABLE_NAME           = aws_dynamodb_table.blogs_table.name
      USERS_TABLE_NAME     = aws_dynamodb_table.users_table.name
      ADMIN_EMAIL          = var.admin_email
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_REGION       = data.aws_region.current.name
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.client.id
    }
  }
}
```

> **Gotcha:** The `triggers` block in `null_resource` only runs `pip install` when `requirements.txt` changes. If you update your Python code without changing requirements, the old packages in the zip remain — which is fine. But if you ever switch package sources or versions, you must update `requirements.txt` to trigger a fresh install.

---

## Lessons Learned

1. **A single Lambda router is simpler than many small Lambdas.** Less infrastructure, one log group, one deployment. The tradeoff is that a bug in the router affects all routes — but that is easy to mitigate with thorough testing.

2. **`PAY_PER_REQUEST` DynamoDB is perfect for low-traffic apps.** No capacity planning, no wasted money on idle capacity.

3. **Design your DynamoDB access patterns first.** I store comments and likes directly on the blog item. This means a single `GetItem` call returns everything — no JOINs, no extra queries.

4. **HTTP API (v2) is almost always better than REST API (v1) for new projects.** It is cheaper, faster to configure in Terraform, and handles CORS natively.

5. **Package Lambda dependencies in CI, not locally.** If you package on a Mac and deploy to Linux-based Lambda, native extensions can break. Always package in CI on a Linux runner.

---

## What's Next?

In the next post, I will cover **AWS Cognito** — how I set up user authentication with email/password sign-up, email verification, and Google OAuth, so users can sign in with one click and post comments.

If you have questions about the architecture or hit any issues replicating it, drop a comment below. Happy building! :)
