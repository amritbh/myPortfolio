output "api_endpoint" {
  description = "The URL of the HTTP API Gateway endpoint"
  value       = aws_apigatewayv2_api.http_api.api_endpoint
}

output "cognito_user_pool_id" {
  value = aws_cognito_user_pool.pool.id
}

output "cognito_client_id" {
  value = aws_cognito_user_pool_client.client.id
}

output "cognito_domain" {
  value = "${aws_cognito_user_pool_domain.main.domain}.auth.us-east-1.amazoncognito.com"
}

output "cloudfront_media_url" {
  description = "CloudFront base URL for blog media (path-based on main amrit.cloud domain)"
  value       = "https://amrit.cloud/media"
}

output "media_bucket_name" {
  description = "Name of the S3 media bucket"
  value       = aws_s3_bucket.media_bucket.id
}

output "media_bucket_arn" {
  description = "ARN of the S3 media bucket"
  value       = aws_s3_bucket.media_bucket.arn
}

output "media_bucket_regional_domain" {
  description = "Regional domain of the S3 media bucket for CloudFront origin"
  value       = aws_s3_bucket.media_bucket.bucket_regional_domain_name
}
