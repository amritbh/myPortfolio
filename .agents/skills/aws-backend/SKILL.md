---
name: AWS Backend
description: Lambda function architecture, API Gateway routing, DynamoDB schema, authentication, and Python backend patterns for the portfolio API. Use this skill when modifying app.py, API routes, DynamoDB tables, or backend tests.
---

# AWS Backend Architecture

The backend is a **single Python Lambda function** (`infra/modules/backend/src/app.py`) that handles ALL API routes via path-based routing in the `lambda_handler()` function.

## Key Files

| File                                              | Purpose                                    |
| ------------------------------------------------- | ------------------------------------------ |
| `infra/modules/backend/src/app.py`                | Main Lambda handler (all business logic)   |
| `infra/modules/backend/src/test_app.py`           | Pytest tests with mocking                  |
| `infra/modules/backend/src/requirements.txt`      | Runtime deps (`python-jose`)               |
| `infra/modules/backend/src/requirements-test.txt` | Test deps (pytest, moto, bandit, coverage) |
| `infra/modules/backend/main.tf`                   | Lambda + DynamoDB resources                |
| `infra/modules/backend/api_gateway.tf`            | HTTP API routes                            |
| `infra/modules/backend/cognito.tf`                | Auth infrastructure                        |
| `infra/modules/backend/iam.tf`                    | Lambda execution role                      |
| `infra/modules/backend/variables.tf`              | Input variables                            |
| `infra/modules/backend/outputs.tf`                | Output values (API endpoint, Cognito info) |

## Lambda Handler — Route Dispatch

The `lambda_handler(event, context)` function routes requests based on `rawPath` and HTTP method:

```python
path = event.get('rawPath', event.get('path', ''))
method = event.get('requestContext', {}).get('http', {}).get('method', event.get('httpMethod', 'GET'))
```

### Route Map

| Method | Path                    | Handler Function               | Auth Required     |
| ------ | ----------------------- | ------------------------------ | ----------------- |
| POST   | `/auth/signup`          | `signup_admin(event)`          | No                |
| POST   | `/auth/login`           | `login_admin(event)`           | No                |
| POST   | `/auth/verify-email`    | `verify_email_route(event)`    | No                |
| POST   | `/auth/forgot-password` | `forgot_password_route(event)` | No                |
| POST   | `/auth/reset-password`  | `reset_password_route(event)`  | No                |
| POST   | `/portfolio`            | `contact_portfolio(event)`     | No                |
| GET    | `/blogs`                | `get_all_blogs()`              | No                |
| POST   | `/blogs`                | `create_blog(event)`           | Yes (admin)       |
| GET    | `/blogs/{slug}`         | `get_blog_by_slug(slug)`       | No                |
| PUT    | `/blogs/{slug}`         | `update_blog(event, slug)`     | Yes (admin)       |
| DELETE | `/blogs/{slug}`         | `delete_blog(event, slug)`     | Yes (admin)       |
| POST   | `/blogs/{slug}/like`    | `like_blog(event, slug)`       | Yes (any user)    |
| POST   | `/blogs/{slug}/comment` | `comment_blog(event, slug)`    | Yes (any user)    |
| DELETE | `/blogs/{slug}/comment` | `delete_comment(event, slug)`  | Yes (owner/admin) |

### Path Parsing for Nested Routes

```python
parts = path.split('/')
slug = parts[2]  # e.g., /blogs/my-post → "my-post"
# parts[3] for sub-resources: "like" or "comment"
```

Legacy path aliases are supported (e.g., `/signup` → `/auth/signup`).

## S3 Media Partitioning

Media uploads via the `/media/upload-url` endpoint are partitioned using **Entity-Based Partitioning**.
When requesting a presigned URL, the frontend can pass a `blogSlug` in the JSON payload:

- If `blogSlug` is provided: Images are stored under `media/blogs/{blogSlug}/`
- If no slug is provided: Images fall back to `media/drafts/`

This ensures easy cleanup and clear organization as content scales.

## DynamoDB Schema

### Blogs Table (`${project_name}-${env}-blogs`)

- **Hash Key**: `slug` (String)
- **GSI**: `PublishDateIndex` on `publishDate`
- Billing: PAY_PER_REQUEST
- Deletion protection: enabled

#### Blog Item Shape

```json
{
  "slug": "my-blog-post",
  "title": "Blog Title",
  "summary": "Brief description",
  "content": "Full markdown content",
  "publishDate": "2026-07-04T12:00:00Z",
  "coverImage": "https://...",
  "author": { "name": "Amrit Bhattarai", "avatar": "..." },
  "tags": ["AWS", "Terraform"],
  "readTime": "6 min read",
  "likes": ["username1", "username2"],
  "comments": [
    {
      "id": "1720000000000",
      "username": "user@email.com",
      "name": "Display Name",
      "picture": "https://...",
      "text": "Great post!",
      "timestamp": "2026-07-04T12:00:00Z"
    }
  ]
}
```

### Users Table (`${project_name}-${env}-users`)

- **Hash Key**: `username` (String)
- Billing: PAY_PER_REQUEST
- Deletion protection: enabled

#### User Item Shape

```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password_hash": "<base64-encoded>",
  "salt": "<base64-encoded>",
  "role": "user",
  "verified": false,
  "createdAt": "2026-07-04T12:00:00Z"
}
```

## Authentication Pattern

### The `authenticate()` Function

Used by all protected routes. Dual verification strategy:

1. Extract token from `Authorization: Bearer <token>` header
2. Try custom HS256 verification (`verify_jwt`)
3. If that returns `None`, try Cognito RS256 verification (`verify_cognito_jwt`)
4. If Cognito returns `{'error': ...}`, wrap in `{'__auth_error': msg}`

### Admin vs User Authorization

- **Admin routes** (create/update/delete blogs): Check `payload.get('role') == 'admin'`
- **User routes** (like/comment): Just check `payload` is valid and not None
- Admin detection: `email == ADMIN_EMAIL` environment variable

### Comment deletion: Owner OR admin can delete

```python
if c.get('username') == username or role == 'admin':
    deleted = True
```

## Response Format

ALL responses follow this pattern:

```python
{
    'statusCode': 200,  # or 201, 400, 401, 403, 404, 500
    'headers': {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    },
    'body': json.dumps({...})  # Always JSON-serialized string
}
```

## Lambda Environment Variables

| Variable               | Source                                   | Purpose                    |
| ---------------------- | ---------------------------------------- | -------------------------- |
| `TABLE_NAME`           | `aws_dynamodb_table.blogs_table.name`    | Blogs DynamoDB table       |
| `USERS_TABLE_NAME`     | `aws_dynamodb_table.users_table.name`    | Users DynamoDB table       |
| `ADMIN_EMAIL`          | `var.admin_email`                        | Email that gets admin role |
| `SENDER_EMAIL`         | `var.admin_email`                        | SES sender address         |
| `COGNITO_USER_POOL_ID` | `aws_cognito_user_pool.pool.id`          | For JWKS URL               |
| `COGNITO_REGION`       | `data.aws_region.current.name`           | For JWKS URL               |
| `COGNITO_CLIENT_ID`    | `aws_cognito_user_pool_client.client.id` | For JWT validation         |

## API Gateway Configuration

- Type: **HTTP API** (v2), not REST API
- CORS: `allow_origins = ["*"]`, methods: GET/POST/PUT/DELETE/OPTIONS
- Each route is a separate `aws_apigatewayv2_route` resource
- Single integration: `AWS_PROXY` to the Lambda function
- Stage: `$default` with `auto_deploy = true`

## Dependency Packaging

Python dependencies are packaged INLINE with the Lambda code:

```bash
pip3 install -r requirements.txt -t . --upgrade
```

This installs packages directly into the `src/` directory, then everything is zipped together via Terraform's `archive_file` data source.

## Testing

### Running Tests

```bash
cd infra/modules/backend/src
pip install -r requirements-test.txt
python -m pytest --cov=. --cov-report=xml test_app.py
bandit -r app.py  # Security scan
```

### Terraform Tests

```bash
cd infra/modules/backend
terraform init && terraform test
# Test files: tests/backend.tftest.hcl, tests/cognito.tftest.hcl
```

## Checklist: Adding a New API Route

1. Add handler function in `app.py` following existing patterns
2. Add route dispatch in `lambda_handler()` with path and method matching
3. Add `aws_apigatewayv2_route` resource in `api_gateway.tf`
4. If authenticated, use `authenticate(event)` and check `__auth_error`
5. Add corresponding frontend function in `src/utils/apiClient.js`
6. Add tests in `test_app.py` and `apiClient.test.js`
7. Use consistent response format with CORS headers
