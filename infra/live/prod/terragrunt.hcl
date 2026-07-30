include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../modules/backend"
}

# Depend on the frontend module to get the CloudFront ARN for the media bucket policy.
# On first deploy, this will use mock_outputs so the backend can deploy before frontend exists.
dependency "frontend" {
  config_path = "./frontend"

  mock_outputs = {
    cloudfront_distribution_arn = "arn:aws:cloudfront::000000000000:distribution/MOCK"
    cloudfront_distribution_id  = "MOCK"
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan", "apply"]
}

inputs = {
  project_name            = "amrit-portfolio"
  environment             = "prod"
  frontend_cloudfront_arn = dependency.frontend.outputs.cloudfront_distribution_arn
}
