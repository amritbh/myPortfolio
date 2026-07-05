data "aws_route53_zone" "main" {
  name = var.domain_name
}

# -------------------------------------------------------------------------
# SES Domain Identity (amrit.cloud)
# -------------------------------------------------------------------------
resource "aws_ses_domain_identity" "domain" {
  domain = var.domain_name
}

resource "aws_ses_domain_dkim" "dkim" {
  domain = aws_ses_domain_identity.domain.domain
}

resource "aws_route53_record" "dkim_record" {
  count   = 3
  zone_id = data.aws_route53_zone.main.zone_id
  name    = "${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}._domainkey"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.dkim.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

resource "aws_route53_record" "mx_record" {
  zone_id = data.aws_route53_zone.main.zone_id
  name    = var.domain_name
  type    = "MX"
  ttl     = 600
  records = ["10 inbound-smtp.${var.region}.amazonaws.com"]
}

# -------------------------------------------------------------------------
# SES Email Identity (Destination Gmail)
# -------------------------------------------------------------------------
resource "aws_ses_email_identity" "forward_email" {
  email = var.forward_email
}

# -------------------------------------------------------------------------
# S3 Bucket for Inbound Emails
# -------------------------------------------------------------------------
resource "aws_s3_bucket" "inbound_mail" {
  bucket        = "inbound-mail-${replace(var.domain_name, ".", "-")}-${random_id.bucket_suffix.hex}"
  force_destroy = true
}

resource "random_id" "bucket_suffix" {
  byte_length = 4
}

resource "aws_s3_bucket_policy" "ses_put_policy" {
  bucket = aws_s3_bucket.inbound_mail.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Service = "ses.amazonaws.com"
        }
        Action = "s3:PutObject"
        Resource = "${aws_s3_bucket.inbound_mail.arn}/*"
        Condition = {
          StringEquals = {
            "aws:Referer" = data.aws_caller_identity.current.account_id
          }
        }
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

# -------------------------------------------------------------------------
# Lambda Function to Forward Email
# -------------------------------------------------------------------------
resource "aws_iam_role" "lambda_forwarder_role" {
  name = "lambda-ses-forwarder-role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda_forwarder_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy" "lambda_forwarder_policy" {
  name   = "lambda-ses-forwarder-policy"
  role   = aws_iam_role.lambda_forwarder_role.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject"]
        Resource = "${aws_s3_bucket.inbound_mail.arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendRawEmail"]
        Resource = "*"
      }
    ]
  })
}

data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/lambda_function.zip"
}

resource "aws_lambda_function" "forwarder" {
  filename         = data.archive_file.lambda_zip.output_path
  function_name    = "ses-email-forwarder"
  role             = aws_iam_role.lambda_forwarder_role.arn
  handler          = "forwarder.lambda_handler"
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  runtime          = "python3.9"
  timeout          = 30

  environment {
    variables = {
      FORWARD_TO      = var.forward_email
      S3_BUCKET       = aws_s3_bucket.inbound_mail.bucket
      S3_PREFIX       = ""
    }
  }
}

resource "aws_lambda_permission" "allow_ses" {
  statement_id   = "AllowExecutionFromSES"
  action         = "lambda:InvokeFunction"
  function_name  = aws_lambda_function.forwarder.function_name
  principal      = "ses.amazonaws.com"
  source_account = data.aws_caller_identity.current.account_id
}

# -------------------------------------------------------------------------
# SES Receipt Rule Set
# -------------------------------------------------------------------------
resource "aws_ses_receipt_rule_set" "main" {
  rule_set_name = "inbound-rule-set-${replace(var.domain_name, ".", "-")}"
}

resource "aws_ses_active_receipt_rule_set" "main" {
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
}

resource "aws_ses_receipt_rule" "forwarding_rule" {
  name          = "forward-to-gmail"
  rule_set_name = aws_ses_receipt_rule_set.main.rule_set_name
  recipients    = [var.domain_name]
  enabled       = true
  scan_enabled  = true

  s3_action {
    bucket_name = aws_s3_bucket.inbound_mail.bucket
    position    = 1
  }

  lambda_action {
    function_arn    = aws_lambda_function.forwarder.arn
    invocation_type = "Event"
    position        = 2
  }

  depends_on = [
    aws_s3_bucket_policy.ses_put_policy,
    aws_lambda_permission.allow_ses
  ]
}

# -------------------------------------------------------------------------
# IAM User for SMTP Authentication (Replying from Gmail)
# -------------------------------------------------------------------------
resource "aws_iam_user" "smtp_user" {
  name = "ses-smtp-user-${replace(var.domain_name, ".", "-")}"
}

resource "aws_iam_access_key" "smtp_user_key" {
  user = aws_iam_user.smtp_user.name
}

resource "aws_iam_user_policy" "smtp_user_policy" {
  name   = "ses-smtp-policy"
  user   = aws_iam_user.smtp_user.name
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = "ses:SendRawEmail"
        Resource = "*"
      }
    ]
  })
}
