output "cloudfront_distribution_arn" {
  description = "ARN of the main amrit.cloud CloudFront distribution"
  value       = aws_cloudfront_distribution.cdn.arn
}

output "cloudfront_distribution_id" {
  description = "ID of the main amrit.cloud CloudFront distribution"
  value       = aws_cloudfront_distribution.cdn.id
}
