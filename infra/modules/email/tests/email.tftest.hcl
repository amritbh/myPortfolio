variables {
  domain_name   = "amrit.cloud"
  forward_email = "test-forward@example.com"
  region        = "us-east-1"
}

run "valid_plan" {
  command = plan

  assert {
    condition     = aws_ses_domain_identity.domain.domain == "amrit.cloud"
    error_message = "SES Domain Identity did not match the expected domain name"
  }

  assert {
    condition     = aws_ses_email_identity.forward_email.email == "test-forward@example.com"
    error_message = "SES Email Identity did not match the expected forward email"
  }

  assert {
    condition     = aws_lambda_function.forwarder.function_name == "ses-email-forwarder"
    error_message = "Lambda function name did not match"
  }

  assert {
    condition     = aws_lambda_function.forwarder.runtime == "python3.9"
    error_message = "Lambda function runtime did not match python3.9"
  }

  assert {
    condition     = aws_iam_role.lambda_forwarder_role.name == "lambda-ses-forwarder-role"
    error_message = "IAM Role name for Lambda forwarder did not match"
  }

  assert {
    condition     = aws_ses_receipt_rule_set.main.rule_set_name == "inbound-rule-set-amrit-cloud"
    error_message = "SES Receipt Rule Set name did not match expected format"
  }

  assert {
    condition     = aws_ses_receipt_rule.forwarding_rule.name == "forward-to-gmail"
    error_message = "SES Receipt Rule name did not match"
  }

  assert {
    condition     = aws_iam_user.smtp_user.name == "ses-smtp-user-amrit-cloud"
    error_message = "SMTP IAM user name did not match expected format"
  }
}
