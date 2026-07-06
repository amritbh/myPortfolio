# API Gateway (HTTP API)
resource "aws_apigatewayv2_api" "http_api" {
  name          = "${var.project_name}-${var.environment}-http-api"
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = ["*"] # In prod, restrict this to amrit.cloud
    allow_methods = ["GET", "POST", "OPTIONS"]
    allow_headers = ["content-type", "authorization"]
  }
}

resource "aws_apigatewayv2_integration" "lambda_integration" {
  api_id             = aws_apigatewayv2_api.http_api.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.api_lambda.invoke_arn
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "get_blogs" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /blogs"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_blogs" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /blogs"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "get_blog_by_slug" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "GET /blogs/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "put_blog_by_slug" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "PUT /blogs/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "delete_blog_by_slug" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /blogs/{slug}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_blog_like" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /blogs/{slug}/like"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_blog_comment" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /blogs/{slug}/comment"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "delete_blog_comment" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "DELETE /blogs/{slug}/comment"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_auth_signup" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /auth/signup"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_auth_login" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /auth/login"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_auth_verify_email" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /auth/verify-email"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_auth_forgot_password" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /auth/forgot-password"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_auth_reset_password" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /auth/reset-password"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_route" "post_portfolio" {
  api_id    = aws_apigatewayv2_api.http_api.id
  route_key = "POST /portfolio"
  target    = "integrations/${aws_apigatewayv2_integration.lambda_integration.id}"
}

resource "aws_apigatewayv2_stage" "default" {
  api_id      = aws_apigatewayv2_api.http_api.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_lambda_permission" "api_gw" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api_lambda.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http_api.execution_arn}/*/*"
}
