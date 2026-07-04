variables {
  project_name = "test-portfolio"
  environment  = "test"
}

run "valid_plan" {
  command = plan

  assert {
    condition     = aws_dynamodb_table.blogs_table.name == "test-portfolio-test-blogs"
    error_message = "DynamoDB table name did not match expected format"
  }

  assert {
    condition     = aws_lambda_function.api_lambda.function_name == "test-portfolio-test-api"
    error_message = "Lambda function name did not match expected format"
  }
}
