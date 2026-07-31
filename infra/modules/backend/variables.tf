variable "project_name" {
  description = "Project name used as a prefix for all resources"
  type        = string
  default     = "my-portfolio"
}

variable "environment" {
  description = "Deployment environment (e.g., prod, staging)"
  type        = string
  default     = "prod"
}

variable "admin_email" {
  description = "Email address for the admin user"
  type        = string
  validation {
    condition     = length(var.admin_email) > 0
    error_message = "The admin_email variable cannot be empty. If running in CI/CD, ensure the ADMIN_EMAIL GitHub secret is set."
  }
}

variable "system_email" {
  description = "Email address for system notifications and Cognito emails"
  type        = string
  validation {
    condition     = length(var.system_email) > 0
    error_message = "The system_email variable cannot be empty. If running in CI/CD, ensure the SYSTEM_EMAIL GitHub secret is set."
  }
}


variable "google_client_id" {
  type        = string
  description = "Client ID for Google OAuth"
  default     = ""
}

variable "google_client_secret" {
  type        = string
  description = "Client Secret for Google OAuth"
  default     = ""
}

variable "apple_client_id" {
  type        = string
  description = "Client ID for Apple OAuth"
  default     = ""
}

variable "apple_team_id" {
  type        = string
  description = "Team ID for Apple OAuth"
  default     = ""
}

variable "apple_key_id" {
  type        = string
  description = "Key ID for Apple OAuth"
  default     = ""
}

variable "apple_private_key" {
  type        = string
  description = "Private Key for Apple OAuth"
  default     = ""
}

variable "github_client_id" {
  type        = string
  description = "Client ID for GitHub OAuth"
  default     = ""
}

variable "github_client_secret" {
  type        = string
  description = "Client Secret for GitHub OAuth"
  default     = ""
}

