variables {
  project_name         = "test-portfolio"
  environment          = "test"
  google_client_id     = "mock-google-client-id"
  google_client_secret = "mock-google-client-secret"
  admin_password       = "test12345"
}

run "verify_cognito_resources" {
  command = plan

  assert {
    condition     = aws_cognito_user_pool.pool.name == "amrit-portfolio-users-test"
    error_message = "Cognito User Pool name is not configured correctly."
  }

  assert {
    condition     = aws_cognito_user_pool_client.client.name == "portfolio-frontend"
    error_message = "Cognito User Pool Client name is not configured correctly."
  }

  assert {
    condition     = aws_cognito_identity_provider.google.provider_name == "Google"
    error_message = "Cognito Identity Provider should be named Google."
  }

  assert {
    condition     = contains(aws_cognito_user_pool_client.client.supported_identity_providers, "Google")
    error_message = "Client should support Google identity provider."
  }
}
