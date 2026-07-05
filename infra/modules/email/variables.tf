variable "domain_name" {
  description = "The custom domain name for SES (e.g., amrit.cloud)"
  type        = string
}

variable "forward_email" {
  description = "The destination email address to forward to (e.g., your personal Gmail)"
  type        = string
}

variable "region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-east-1"
}
