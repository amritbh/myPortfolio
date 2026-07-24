resource "aws_cognito_user_pool" "pool" {
  name = "amrit-portfolio-users-${var.environment}"

  auto_verified_attributes = ["email"]
  username_attributes      = ["email"]

  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-auth-v2-${var.environment}"
  user_pool_id = aws_cognito_user_pool.pool.id
}

resource "aws_cognito_user_pool_client" "client" {
  name         = "portfolio-frontend"
  user_pool_id = aws_cognito_user_pool.pool.id

  generate_secret = false # False for SPAs (React)

  allowed_oauth_flows_user_pool_client = true
  allowed_oauth_flows                  = ["code", "implicit"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]

  callback_urls = [
    "https://amrit.cloud/login",
    "http://localhost:3000/login"
  ]
  logout_urls = [
    "https://amrit.cloud/",
    "http://localhost:3000/"
  ]

  supported_identity_providers = ["COGNITO", "Google"]

  depends_on = [
    aws_cognito_identity_provider.google
  ]
}

# --- Google IdP ---
resource "aws_cognito_identity_provider" "google" {
  user_pool_id  = aws_cognito_user_pool.pool.id
  provider_name = "Google"
  provider_type = "Google"

  provider_details = {
    authorize_scopes = "email profile openid"
    client_id        = var.google_client_id
    client_secret    = var.google_client_secret
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
    picture  = "picture"
  }
}
