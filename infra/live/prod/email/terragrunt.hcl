include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../../modules/email"
}

inputs = {
  domain_name   = "amrit.cloud"
  forward_email = "iamamrit990@gmail.com"
  region        = "us-east-1"
}
