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
  default     = "amrit.bhattarai990@gmail.com"
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
