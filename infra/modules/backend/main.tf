data "aws_region" "current" {}

# DynamoDB Table
resource "aws_dynamodb_table" "blogs_table" {
  name         = "${var.project_name}-${var.environment}-blogs"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "slug"

  deletion_protection_enabled = true

  attribute {
    name = "slug"
    type = "S"
  }

  attribute {
    name = "publishDate"
    type = "S"
  }

  global_secondary_index {
    name            = "PublishDateIndex"
    projection_type = "ALL"
    
    key_schema {
      attribute_name = "publishDate"
      key_type       = "HASH"
    }
  }
}

# DynamoDB Users Table
resource "aws_dynamodb_table" "users_table" {
  name         = "${var.project_name}-${var.environment}-users"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "username"

  deletion_protection_enabled = true

  attribute {
    name = "username"
    type = "S"
  }
}

# Install Pip Dependencies
resource "null_resource" "pip_install" {
  triggers = {
    requirements = filemd5("${path.module}/src/requirements.txt")
  }

  provisioner "local-exec" {
    command = "pip3 install -r ${path.module}/src/requirements.txt -t ${path.module}/src/ --upgrade"
  }
}

# Package Python Code
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/lambda_function.zip"

  depends_on = [null_resource.pip_install]
}

# Lambda Function
resource "aws_lambda_function" "api_lambda" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "${var.project_name}-${var.environment}-api"
  role             = aws_iam_role.lambda_exec_role.arn
  handler          = "app.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.11"

  environment {
    variables = {
      TABLE_NAME           = aws_dynamodb_table.blogs_table.name
      USERS_TABLE_NAME     = aws_dynamodb_table.users_table.name
      ADMIN_EMAIL          = var.admin_email
      SENDER_EMAIL         = var.system_email
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_REGION       = data.aws_region.current.region
      COGNITO_CLIENT_ID    = aws_cognito_user_pool_client.client.id
      MEDIA_BUCKET_NAME    = aws_s3_bucket.media_bucket.id
      CLOUDFRONT_MEDIA_URL = "https://amrit.cloud"
    }
  }
}
