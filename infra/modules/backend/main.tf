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
    hash_key        = "publishDate"
    projection_type = "ALL"
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
  runtime          = "python3.9"

  environment {
    variables = {
      TABLE_NAME           = aws_dynamodb_table.blogs_table.name
      USERS_TABLE_NAME     = aws_dynamodb_table.users_table.name
      ADMIN_PASSWORD       = "amrit123" # Simple hardcoded default for now
      SENDER_EMAIL         = "noreply@amrit.cloud"
      COGNITO_USER_POOL_ID = aws_cognito_user_pool.pool.id
      COGNITO_REGION       = data.aws_region.current.name
    }
  }
}




