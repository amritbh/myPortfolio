variable "domain_name" {
  description = "The root domain name for the portfolio site"
  type        = string
  default     = "amrit.cloud"
}

variable "media_bucket_arn" {
  description = "ARN of the S3 media bucket managed by the backend module"
  type        = string
}

variable "media_bucket_regional_domain" {
  description = "Regional domain name of the S3 media bucket"
  type        = string
}
