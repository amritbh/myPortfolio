# Route 53 Hosted Zone — the root resource that all other frontend resources depend on
resource "aws_route53_zone" "main" {
  name = var.domain_name
}
