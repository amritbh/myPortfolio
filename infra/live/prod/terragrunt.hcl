include "root" {
  path = find_in_parent_folders("root.hcl")
}

terraform {
  source = "../../modules/backend"
}

inputs = {
  project_name = "amrit-portfolio"
  environment  = "prod"
}
