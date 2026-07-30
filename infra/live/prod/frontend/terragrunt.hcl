include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/frontend"
}

# Depend on backend to get the media bucket details
dependency "backend" {
  config_path = "../"

  mock_outputs = {
    media_bucket_arn             = "arn:aws:s3:::mock-media-bucket"
    media_bucket_regional_domain = "mock-media-bucket.s3.us-east-1.amazonaws.com"
  }

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs_merge_strategy_with_state  = "shallow"
}

inputs = {
  domain_name                  = "amrit.cloud"
  media_bucket_arn             = dependency.backend.outputs.media_bucket_arn
  media_bucket_regional_domain = dependency.backend.outputs.media_bucket_regional_domain
}
