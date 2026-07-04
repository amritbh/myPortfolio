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
