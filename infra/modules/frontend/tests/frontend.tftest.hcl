variables {
  domain_name                  = "test.amrit.cloud"
  media_bucket_arn             = "arn:aws:s3:::mock-media-bucket"
  media_bucket_regional_domain = "mock-media-bucket.s3.us-east-1.amazonaws.com"
}
run "valid_plan" {
  command = plan

  assert {
    condition     = aws_s3_bucket.frontend_bucket.bucket == "test.amrit.cloud"
    error_message = "S3 bucket name did not match the domain name"
  }

  assert {
    condition     = contains(aws_cloudfront_distribution.cdn.aliases, "test.amrit.cloud")
    error_message = "CloudFront distribution aliases did not contain the domain name"
  }
}
