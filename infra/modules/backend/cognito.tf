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
  domain       = "amrit-portfolio-auth-${var.environment}"
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

  # Need to depend on IdPs being created before they can be attached to the client
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
  }
}

# --- Apple IdP ---
# resource "aws_cognito_identity_provider" "apple" {
#   user_pool_id  = aws_cognito_user_pool.pool.id
#   provider_name = "SignInWithApple"
#   provider_type = "SignInWithApple"
# 
#   provider_details = {
#     client_id        = var.apple_client_id
#     team_id          = var.apple_team_id
#     key_id           = var.apple_key_id
#     private_key      = var.apple_private_key
#     authorize_scopes = "email name"
#   }
# 
#   attribute_mapping = {
#     email = "email"
#   }
# }

# --- GitHub OIDC IdP (Requires OpenID Connect bridge or custom lambda) ---
# GitHub is not natively supported by Cognito as a direct Social Provider.
# It requires setting up an OIDC wrapper (like Dex or Auth0) or handling it via Lambda.
# For this phase, we will provision Google and Apple which are native.
