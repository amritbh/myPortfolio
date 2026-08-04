---
name: Terraform Infrastructure
description: Terraform and Terragrunt conventions for the AWS infrastructure including module structure, state management, naming conventions, deployment patterns, and testing. Use this skill when creating or modifying Terraform resources, Terragrunt configs, or infrastructure workflows.
---

# Terraform & Terragrunt Infrastructure

This project uses **Terraform** for AWS resource management and **Terragrunt** for DRY configuration and state management.

## Version Requirements

| Tool         | Version                           |
| ------------ | --------------------------------- |
| Terraform    | `1.14.8` (was 1.8.0)              |
| Terragrunt   | `0.53.8`                          |
| AWS Provider | Defined in module `main.tf` files |

## AWS Profile Conventions

- The primary AWS account used for this project is managed by the `amrit990` profile.
- All local AWS CLI and Terraform commands should assume the `amrit990` credentials as the `[default]` profile or explicitly pass `--profile amrit990`.
- Do NOT use the legacy `jaybhole` profile for this project.

## Directory Structure

```
infra/
├── live/                          # Environment-specific Terragrunt configs
│   ├── root.hcl                   # Root Terragrunt config (S3 backend)
│   └── prod/                      # Production environment
│       ├── terragrunt.hcl         # Backend module config
│       ├── email/                 # Email module config
│       │   └── terragrunt.hcl
│       └── frontend/              # Frontend module config
│           └── terragrunt.hcl
│
└── modules/                       # Reusable Terraform modules
    ├── backend/                   # Lambda + API GW + DynamoDB + Cognito
    │   ├── main.tf               # DynamoDB tables, Lambda function
    │   ├── api_gateway.tf        # HTTP API routes
    │   ├── cognito.tf            # User pool, client, Google IdP
    │   ├── iam.tf                # Lambda execution role
    │   ├── variables.tf          # Input variables
    │   ├── outputs.tf            # API endpoint, Cognito outputs
    │   ├── src/                  # Python Lambda code
    │   └── tests/                # .tftest.hcl files
    │
    ├── frontend/                  # S3 + CloudFront + ACM + Route53
    │   ├── s3.tf                 # S3 bucket for static hosting
    │   ├── cloudfront.tf         # CDN distribution
    │   ├── acm.tf                # SSL certificate
    │   ├── route53.tf            # DNS records
    │   ├── main.tf               # Provider config
    │   ├── providers.tf          # Provider version constraints
    │   ├── variables.tf          # Input variables
    │   └── tests/                # .tftest.hcl files
    │
    └── email/                     # SES email configuration
        ├── main.tf               # SES resources
        ├── variables.tf          # Input variables
        ├── outputs.tf            # Output values
        └── src/                  # Email Lambda source
```

## State Management (Terragrunt)

### Remote State Configuration (`infra/live/root.hcl`)

```hcl
remote_state {
  backend = "s3"
  config = {
    bucket         = "amrit-portfolio-terraform-state-prod-amrit990"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    use_lockfile   = true
  }
}
```

- All child `terragrunt.hcl` files inherit via `find_in_parent_folders("root.hcl")`
- State is stored per-module: each module gets its own state file key
- Native S3 state locking is enabled (`use_lockfile = true`), eliminating the need for a separate DynamoDB table.

### Environment Config (`infra/live/prod/terragrunt.hcl`)

Each environment directory contains a `terragrunt.hcl` that:

- References the module source: `terraform { source = "../../modules/backend" }`
- Passes input variables
- Includes the root config

## Naming Conventions

All AWS resources follow this pattern:

```
${var.project_name}-${var.environment}-<resource-type>
```

Example: `amrit-cloud-prod-blogs`, `amrit-cloud-prod-api`

Standard variables across modules:

- `var.project_name` = `"amrit-cloud"` (or `"my-portfolio"`)
- `var.environment` = `"prod"`

## Format and Validation Rules

These are enforced in CI/CD:

```bash
# Terraform formatting (recursive across all .tf files)
terraform fmt -check -recursive

# Terragrunt HCL formatting (CI uses v0.53.8)
terragrunt hclfmt --terragrunt-check

# Validation
terragrunt run-all validate --terragrunt-non-interactive
```

**CRITICAL RULE:** You MUST always run these formatting commands locally using a `run_command` BEFORE you `git commit` any changes to `.tf` or `.hcl` files, or else the CI pipeline will fail:

```bash
cd infra && terraform fmt -recursive
cd infra && terragrunt hcl fmt   # Use `hcl fmt` for local Terragrunt 1.x, or `hclfmt` for 0.x
```

## Security Scanning

Run in CI/CD on every push:

- **tfsec**: Static analysis of Terraform code for security misconfigurations
- **Trivy**: Vulnerability scanning (filesystem mode, HIGH/CRITICAL severity)
- **Bandit**: Python security linter for Lambda code

## Testing

### Terraform Native Tests

Located in `infra/modules/*/tests/*.tftest.hcl`:

```bash
cd infra/modules/backend && terraform init && terraform test
cd infra/modules/frontend && terraform init && terraform test
```

### Python Lambda Tests

```bash
cd infra/modules/backend/src
pip install -r requirements-test.txt
python -m pytest --cov=. --cov-report=xml test_app.py
```

## Key AWS Resources by Module

### Backend Module

- **DynamoDB**: 2 tables (blogs, users) with PAY_PER_REQUEST billing
- **Lambda**: Python 3.9 runtime, single function for all API routes
- **API Gateway**: HTTP API (v2) with CORS, individual route resources
- **Cognito**: User pool + client + Google IdP
- **IAM**: Lambda execution role with DynamoDB and SES permissions

### Frontend Module

- **S3**: Static website bucket (`amrit.cloud`)
- **CloudFront**: CDN with OAC (Origin Access Control), SPA routing (404/403 → index.html)
- **ACM**: SSL certificate with DNS validation
- **Route53**: A/AAAA alias records for domain + www subdomain

### Email Module

- **SES**: Email sending configuration
- **Lambda**: Email processing function

## Deployment Order

The CI/CD pipeline deploys in this order (dependencies matter):

1. **Backend** (`infra/live/prod/`) — Must be first (frontend needs API URL output)
2. **Frontend** (`infra/live/prod/frontend/`) — Depends on backend outputs
3. **Frontend Build & Deploy** — Fetches `api_endpoint`, `cognito_domain`, `cognito_client_id` from Terragrunt outputs

## Checklist: Adding New Infrastructure

1. Create or modify resources in the appropriate module under `infra/modules/`
2. Add variables to `variables.tf` and outputs to `outputs.tf`
3. Run `terraform fmt -recursive` from `infra/`
4. Add `.tftest.hcl` test file if introducing new resources
5. If the resource produces values needed by the frontend, add Terragrunt outputs
6. Update CI/CD workflow if new deployment steps are needed
7. Never commit `.terraform/` directories or `terraform.tfstate` files

## ⚠️ Important Warnings

- **Deletion protection** is enabled on both DynamoDB tables — removing them requires a two-step process
- **State file corruption** can occur if Terragrunt cache is stale — delete `.terragrunt-cache/` when debugging
- **Lambda packaging**: Dependencies are installed inline into `src/` via pip — the zip includes everything
- **CloudFront**: Cache invalidation is needed after S3 deploys (handled by CI/CD)
