data "aws_caller_identity" "current" {}

# S3 Bucket for Blog Media (images, videos)
#tfsec:ignore:aws-s3-encryption-customer-key
resource "aws_s3_bucket" "media_bucket" {
  bucket = "${var.project_name}-${var.environment}-media"
}

#tfsec:ignore:aws-s3-encryption-customer-key
resource "aws_s3_bucket_server_side_encryption_configuration" "media_bucket_sse" {
  bucket = aws_s3_bucket.media_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# Block all public access — CloudFront OAC handles reads, presigned URLs handle writes
resource "aws_s3_bucket_public_access_block" "media_bucket_pab" {
  bucket                  = aws_s3_bucket.media_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CORS policy — allow browser PUT uploads via presigned URLs from the portfolio domain
resource "aws_s3_bucket_cors_configuration" "media_bucket_cors" {
  bucket = aws_s3_bucket.media_bucket.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["PUT", "GET", "HEAD"]
    allowed_origins = [
      "https://amrit.cloud",
      "https://www.amrit.cloud",
      "http://localhost:3000"
    ]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

# S3 Bucket Policy — allow the main amrit.cloud CloudFront distribution to read objects
# Media is served at amrit.cloud/media/* via a second origin on the existing distribution
# CloudFront distribution OAC reads are allowed for the entire account
resource "aws_s3_bucket_policy" "media_cloudfront_policy" {
  bucket     = aws_s3_bucket.media_bucket.id
  depends_on = [aws_s3_bucket_public_access_block.media_bucket_pab]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowMainCloudFrontOACRead"
        Effect = "Allow"
        Principal = {
          Service = "cloudfront.amazonaws.com"
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.media_bucket.arn}/*"
        Condition = {
          StringLike = {
            "AWS:SourceArn" = "arn:aws:cloudfront::${data.aws_caller_identity.current.account_id}:distribution/*"
          }
        }
      }
    ]
  })
}
