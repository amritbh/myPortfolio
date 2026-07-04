# Backend Architecture & API Design

This document details the serverless backend architecture powering the portfolio's blog system.

---

## 1. Architecture Overview

The backend is a fully serverless Python application deployed to AWS Lambda, fronted by API Gateway v2 (HTTP API), with DynamoDB as the data store. All resources are provisioned and managed via Terraform (`infra/modules/backend/main.tf`).

### Request Flow

```
Client (React App)
  → API Gateway v2 (HTTP API)
    → Lambda Function (Python 3.9)
      → DynamoDB Table
```

---

## 2. Terraform-Managed Resources

Every backend resource is defined in `infra/modules/backend/main.tf` and created fresh by Terraform on the first `apply`:

### Compute & Storage

| Resource        | Terraform Address                | Configuration                                                            |
| --------------- | -------------------------------- | ------------------------------------------------------------------------ |
| Lambda Function | `aws_lambda_function.api_lambda` | Python 3.9, handler: `app.lambda_handler`, 128MB memory, 3s timeout      |
| DynamoDB Table  | `aws_dynamodb_table.blogs_table` | PAY_PER_REQUEST billing, hash key: `slug` (String), GSI on `publishDate` |

### Networking & Routing

| Resource                 | Terraform Address                                 | Configuration                                                |
| ------------------------ | ------------------------------------------------- | ------------------------------------------------------------ |
| HTTP API                 | `aws_apigatewayv2_api.http_api`                   | Protocol: HTTP, CORS: all origins, methods: GET/POST/OPTIONS |
| Lambda Integration       | `aws_apigatewayv2_integration.lambda_integration` | AWS_PROXY type, POST method                                  |
| Route: GET /blogs        | `aws_apigatewayv2_route.get_blogs`                | Lists all blog posts                                         |
| Route: POST /blogs       | `aws_apigatewayv2_route.post_blogs`               | Creates a new blog post (admin)                              |
| Route: GET /blogs/{slug} | `aws_apigatewayv2_route.get_blog_by_slug`         | Fetches a single post by slug                                |
| Default Stage            | `aws_apigatewayv2_stage.default`                  | `$default` stage with auto_deploy enabled                    |
| Lambda Permission        | `aws_lambda_permission.api_gw`                    | Allows API Gateway to invoke the Lambda                      |

### Security & IAM

| Resource               | Terraform Address                                       | Configuration                                                   |
| ---------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| Lambda Execution Role  | `aws_iam_role.lambda_exec_role`                         | Trust policy: `lambda.amazonaws.com`                            |
| Basic Execution Policy | `aws_iam_role_policy_attachment.lambda_basic_execution` | AWS managed `AWSLambdaBasicExecutionRole`                       |
| DynamoDB Policy        | `aws_iam_role_policy.dynamodb_read_policy`              | Inline policy: Scan, Query, GetItem, PutItem on table + indexes |

### Lambda Packaging

The Lambda source code lives at `infra/modules/backend/src/app.py`. Terraform automatically zips this directory using the `archive_file` data source before deploying:

```hcl
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/lambda_function.zip"
}
```

The `source_code_hash` attribute ensures Terraform detects code changes and redeploys the Lambda automatically.

---

## 3. API Gateway Integration Quirks

### Payload Format Versions (Troubleshooting 404 Errors)

When configuring the `aws_apigatewayv2_integration` in Terraform for HTTP APIs, AWS supports two payload format versions: `1.0` and `2.0`.

If the version is not explicitly set to `2.0` in the Terraform module, AWS may default to sending the legacy `1.0` REST API payload format to the Lambda function.

**The Quirk:**

- In Payload **v2.0**, the HTTP path and method are found in: `event['rawPath']` and `event['requestContext']['http']['method']`.
- In Payload **v1.0**, the HTTP path and method are found in: `event['path']` and `event['httpMethod']`.

**The Solution:**
To prevent `404 Not Found` routing errors, the Python Lambda (`app.py`) gracefully parses both formats:

```python
# Gracefully handle both v1.0 and v2.0 API Gateway payloads
path = event.get('rawPath', event.get('path', ''))
method = event.get('requestContext', {}).get('http', {}).get('method', event.get('httpMethod', 'GET'))
```

This ensures the backend dynamically accepts payloads regardless of how API Gateway encapsulates them.

---

## 4. Environment Variables

The Lambda function receives these environment variables via Terraform:

| Variable         | Source                                | Purpose                                          |
| ---------------- | ------------------------------------- | ------------------------------------------------ |
| `TABLE_NAME`     | `aws_dynamodb_table.blogs_table.name` | DynamoDB table name for blog CRUD operations     |
| `ADMIN_PASSWORD` | Hardcoded in Terraform (`amrit123`)   | Simple password for admin blog creation endpoint |

> **Security Note:** The `ADMIN_PASSWORD` is currently hardcoded in the Terraform module. For production hardening, this should be moved to AWS Secrets Manager or GitHub Secrets and injected as a Terraform variable.

---

## 5. CORS Configuration

The API Gateway is configured with permissive CORS for development:

```hcl
cors_configuration {
  allow_origins = ["*"]
  allow_methods = ["GET", "POST", "OPTIONS"]
  allow_headers = ["content-type", "authorization"]
}
```

> **Production Note:** The `allow_origins` should be restricted to `["https://amrit.cloud", "https://www.amrit.cloud"]` for production security.

---

## 6. DynamoDB Schema

### Table: `amrit-portfolio-prod-blogs`

| Attribute     | Type       | Key                  |
| ------------- | ---------- | -------------------- |
| `slug`        | String (S) | Partition Key (Hash) |
| `publishDate` | String (S) | GSI Hash Key         |

### Global Secondary Index: `PublishDateIndex`

- **Hash Key**: `publishDate`
- **Projection**: ALL (all attributes are projected into the index)
- **Purpose**: Enables efficient queries to list blogs sorted by publish date

### Item Schema (Application Level)

```json
{
  "slug": "unique-slug-string",
  "title": "Post Title",
  "summary": "Short description...",
  "content": "# Full markdown body",
  "publishDate": "2026-07-04T12:00:00Z",
  "readTime": "5 min read",
  "tags": ["Tag1", "Tag2"],
  "coverImage": "https://url-to-s3-image.jpg",
  "author": {
    "name": "Amrit",
    "avatar": "https://url-to-github-avatar.jpg"
  }
}
```
