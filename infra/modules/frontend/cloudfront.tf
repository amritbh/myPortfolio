# CloudFront Origin Access Control — frontend S3 bucket
resource "aws_cloudfront_origin_access_control" "default" {
  name                              = "${var.domain_name}-oac"
  description                       = "OAC for ${var.domain_name}"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Origin Access Control — media S3 bucket (separate OAC for least-privilege)
resource "aws_cloudfront_origin_access_control" "media" {
  name                              = "${var.domain_name}-media-oac"
  description                       = "OAC for ${var.domain_name} media bucket"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# CloudFront Distribution — serves both the React app AND /media/* from the media bucket
# Using a single distribution means:
#   - No extra CloudFront distribution cost
#   - No extra ACM cert (existing *.amrit.cloud cert covers everything)
#   - No extra Route53 records
#   - No CORS issues (same domain for app and media)
#tfsec:ignore:aws-cloudfront-enable-waf
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  aliases             = [var.domain_name, "www.${var.domain_name}"]

  # Origin 1: React SPA (default)
  origin {
    domain_name              = aws_s3_bucket.frontend_bucket.bucket_regional_domain_name
    origin_id                = "S3-${aws_s3_bucket.frontend_bucket.id}"
    origin_access_control_id = aws_cloudfront_origin_access_control.default.id
  }

  # Origin 2: Media assets (images/videos uploaded by admin)
  origin {
    domain_name              = var.media_bucket_regional_domain
    origin_id                = "S3-media"
    origin_access_control_id = aws_cloudfront_origin_access_control.media.id
  }

  # Cache Behavior: /media/* — routes to media bucket with 1-year TTL
  # Files are content-addressed by UUID so they are effectively immutable
  ordered_cache_behavior {
    path_pattern     = "/media/*"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-media"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400    # 1 day default
    max_ttl                = 31536000 # 1 year max — UUIDs make files immutable
    compress               = true
  }

  # Default Cache Behavior: everything else → React SPA
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.frontend_bucket.id}"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  # SPA Routing: Redirect 404/403 to index.html
  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 403
    response_code         = 200
    response_page_path    = "/index.html"
  }

  custom_error_response {
    error_caching_min_ttl = 300
    error_code            = 404
    response_code         = 200
    response_page_path    = "/index.html"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cert_validation.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}
