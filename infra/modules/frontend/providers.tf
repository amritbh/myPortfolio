# AWS Provider config specifically for ACM which must be in us-east-1 for CloudFront
provider "aws" {
  alias  = "us-east-1"
  region = "us-east-1"
}
