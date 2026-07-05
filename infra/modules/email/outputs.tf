output "smtp_username" {
  description = "The IAM username for SMTP credentials"
  value       = aws_iam_access_key.smtp_user_key.id
}

output "smtp_password" {
  description = "The SMTP password for the SES IAM user"
  value       = aws_iam_access_key.smtp_user_key.ses_smtp_password_v4
  sensitive   = true
}

output "ses_inbound_endpoint" {
  description = "The SES inbound endpoint for the MX record"
  value       = "inbound-smtp.${var.region}.amazonaws.com"
}
