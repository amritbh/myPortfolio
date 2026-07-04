terraform {
  source = "../../modules/backend"
}

inputs = {
  project_name = "amrit-portfolio"
  environment  = "prod"
}
