# CI/CD & GitOps Architecture

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipelines configured for this portfolio project using GitHub Actions, following a strict **GitOps** methodology.

---

## 1. Frontend CI/CD (React & S3)

**Workflow File:** `.github/workflows/ci-cd.yml` (Frontend Deploy Job)

The frontend application code lives in the root directory (Create React App). Its deployment is triggered as part of the unified CI/CD pipeline, but crucially, it waits for the infrastructure job to pass.

- **Trigger**: Runs automatically whenever code is merged into the `main` branch.
- **Process**:

  - Checks out the repository and configures AWS credentials using `aws-actions/configure-aws-credentials`.
  - Installs Node.js dependencies (`npm ci`).
  - Runs React frontend tests and collects **Code Coverage** (`CI=true npm run test -- --coverage`).
  - Extracts the dynamic `api_endpoint` URL from the live Terraform state (`terragrunt output -raw api_endpoint`) to link the frontend to the backend.
  - Builds the React production bundle (`npm run build`).
  - Syncs the build folder to the S3 bucket using the AWS CLI.
  - Automates CloudFront cache invalidation to ensure users receive the latest version of the application immediately.
  - Verifies the deployment by listing the objects in the S3 bucket.
  - Runs a Dynamic Application Security Test (**DAST**) using the **OWASP ZAP Baseline Scanner** (`zaproxy/action-baseline`) with `cmd_options: '-a'` against the newly deployed live production site.

> **Security Note:** The ZAP Baseline scanner will automatically open a GitHub Issue in this repository if it detects high-level security vulnerabilities, and it uploads a detailed HTML report as a workflow artifact. To support this, the workflow explicitly requests the `issues: write` and `actions: write` permissions.

## Security & Quality Gates (`sonar.yml`)

We run a dedicated, parallel pipeline on all Pull Requests and pushes to `main` that integrates with **SonarCloud**.

- **Process**:
  - Runs frontend Jest tests with coverage (maintaining >80% code coverage requirement).
  - Runs backend Pytest tests with coverage.
  - Enforces SonarQube **Security Rating A** by requiring cryptographically secure random number generators (`window.crypto`), `rel="noreferrer noopener"` on all external links, and zero hardcoded secret/API URL strings.
  - Enforces **Code Duplication < 3.0%** across the repository.
  - Uploads all coverage reports, code smells, and SAST vulnerabilities to the SonarCloud dashboard for unified visibility.

---

## 2. Infrastructure CI/CD (GitOps & Terragrunt)

**Workflow Files:** `.github/workflows/infra-plan.yml` and `.github/workflows/ci-cd.yml` (Infrastructure Job)

The AWS infrastructure (API Gateway, DynamoDB, Lambda, CloudFront, Route53, S3, ACM, IAM) is managed via Terraform and Terragrunt using a strict **GitOps** approach. This guarantees that the `main` branch is the single source of truth for all infrastructure.

### The Pull Request Flow (Plan)

- **Trigger**: Runs automatically whenever a Pull Request is opened or updated targeting the `main` branch (and modifies files in the `infra/` directory).
- **Process**:
  - Automatically installs the correct versions of Terraform (v1.8.0) and Terragrunt (v0.53.8).
  - Performs syntax formatting checks (`terraform fmt` and `terragrunt hclfmt`).
  - Validates the overall configuration (`terragrunt validate`).
  - Runs a static security analysis using `tfsec` (currently set to soft-fail mode to report warnings).
  - Runs a filesystem vulnerability scan across the entire repository using **Trivy** (`aquasecurity/trivy-action`).
  - Installs Python 3.9 and runs Backend Application tests with **Coverage** (`pytest-cov`) and Python SAST scanning using **Bandit**.
  - Runs automated infrastructure unit tests on the backend module using `terraform test`.
  - Runs automated infrastructure unit tests on the frontend module using `terraform test`.
  - Navigates to both the backend and frontend modules.
  - Executes `terragrunt plan --terragrunt-non-interactive` to verify the syntax and output exactly which AWS resources will be created, modified, or destroyed.
- **Safety**: This step is purely dry-run and strictly read-only. It allows developers to safely review infrastructure changes and verify module code logic via tests before approving the PR.

### The Merge Flow (Apply)

- **Trigger**: Runs automatically whenever code is successfully merged into the `main` branch.
- **Process**:
  - Re-authenticates with AWS and re-installs Terraform (v1.8.0)/Terragrunt.
  - Runs formatting and validation checks (`terraform fmt`, `terragrunt hclfmt`, `terragrunt validate`).
  - Scans infrastructure code for security vulnerabilities using `tfsec`.
  - Runs a filesystem vulnerability scan across the entire repository using **Trivy**.
  - Installs Python 3.9 and runs Backend Application tests with **Coverage** (`pytest-cov`) and Python SAST scanning using **Bandit**.
  - Executes infrastructure unit tests on the backend module (`terraform test`).
  - Executes infrastructure unit tests on the frontend module (`terraform test`).
  - Executes `terragrunt apply --terragrunt-non-interactive -auto-approve` for the Backend architecture.
  - Executes `terragrunt apply --terragrunt-non-interactive -auto-approve` for the Frontend architecture.
- **Automation**: Instantly tests and provisions or updates the live AWS cloud resources without any manual intervention from the developer's local terminal.

### Non-Interactive Mode (`--terragrunt-non-interactive`)

**Why this flag is critical:**

Terragrunt performs automatic validation of the remote state S3 bucket on every run. If the bucket is missing recommended settings (versioning, encryption, or a bucket policy), Terragrunt will prompt the user interactively:

```
Remote state S3 bucket is out of date. Would you like Terragrunt to update it? (y/n)
```

In a GitHub Actions runner, there is no terminal to accept input. Without the `--terragrunt-non-interactive` flag, Terragrunt reads `EOF` from stdin and crashes immediately with exit code 1.

**The fix involves two layers:**

1. **Environment Variable**: `TERRAGRUNT_NON_INTERACTIVE=true` is set as a job-level environment variable.
2. **CLI Flag**: `--terragrunt-non-interactive` is explicitly passed to every `terragrunt` command.

This ensures Terragrunt automatically answers "yes" to any bucket configuration prompts and proceeds without blocking.

---

## 3. Remote State Backend (S3)

To ensure that Terraform can safely execute in an ephemeral GitHub Actions runner without losing its state, the CI/CD pipeline uses a **Remote State Backend**.

### State Bucket Configuration

| Setting                 | Value                                                     |
| ----------------------- | --------------------------------------------------------- |
| **S3 Bucket**           | `amrit-portfolio-terraform-state-prod-amrit990`           |
| **DynamoDB Lock Table** | `amrit-portfolio-terraform-locks-amrit990`                |
| **Region**              | `us-east-1`                                               |
| **Encryption**          | Server-Side Encryption (SSE-KMS) with Bucket Key enabled  |
| **Versioning**          | Enabled — allows rollback to previous state versions      |
| **Bucket Policy**       | Enforces TLS-only access; grants root account full access |

### State File Paths

Terragrunt uses `path_relative_to_include()` to generate unique state keys per module:

| Module                                  | State Key                    |
| --------------------------------------- | ---------------------------- |
| Backend (Lambda, DynamoDB, API GW)      | `./terraform.tfstate`        |
| Frontend (S3, CloudFront, Route53, ACM) | `frontend/terraform.tfstate` |

### Dynamic Configuration (`root.hcl`)

The file `infra/live/root.hcl` is the shared remote state configuration. Both the backend and frontend `terragrunt.hcl` files include it:

```hcl
include "root" {
  path = find_in_parent_folders("root.hcl")
}

remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "amrit-portfolio-terraform-state-prod-amrit990"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "amrit-portfolio-terraform-locks-amrit990"
  }
}
```

### S3 State Bucket Security Hardening

The state bucket has the following security measures applied directly via the AWS CLI (these are infrastructure prerequisites, not managed by Terraform to avoid a chicken-and-egg problem):

1. **Bucket Policy** — Denies any non-TLS (`http://`) access and grants the `amrit990` root account full control.
2. **Server-Side Encryption** — Uses `aws:kms` SSE with BucketKey enabled for cost-efficient encryption.
3. **Versioning** — Enabled so that accidental state corruption can be rolled back.

> **Important:** These bucket-level settings must be applied manually _before_ the first CI/CD run. Terragrunt validates them on init, and missing settings will cause interactive prompts or errors in non-interactive mode.

---

## 4. Multi-Account Architecture

### Account Boundaries

| AWS Account    | Profile    | Account ID     | Resources Managed                                                                                                                            |
| -------------- | ---------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `amrit990`     | `amrit990` | `767397976993` | **All resources** — Frontend (Route53, S3, CloudFront, ACM) + Backend (Lambda, DynamoDB, API Gateway, IAM)                                   |
| `jay` (legacy) | `jaybhole` | `025064823204` | **None** — Fully cleaned. Only legacy `s3-terraform-terragrunt-state` bucket and `portfolioFunction` Lambda remain (pre-existing, unrelated) |

### Historical Context

The project originally had backend resources split across the `jay` account (via `terraformuser` credentials) and frontend resources in the `amrit990` account. This multi-account split was consolidated: all portfolio resources now live exclusively in the `amrit990` account.

During the consolidation, orphaned resources from failed CI/CD runs were manually cleaned from both accounts:

**Resources cleaned from `amrit990`:**

- `amrit-portfolio-prod-blogs` (DynamoDB table)
- `amrit-portfolio-prod-api` (Lambda function)
- `amrit-portfolio-prod-lambda-role` (IAM role + inline policy)

**Resources cleaned from `jay`:**

- `amrit-portfolio-prod-blogs` (DynamoDB table)
- `amrit-portfolio-prod-http-api` (API Gateway v2)
- `amrit-portfolio-prod-api` (Lambda function)
- `amrit-portfolio-prod-lambda-role` (IAM role + inline policy + attached policy)
- `amrit-portfolio-terraform-locks` (DynamoDB lock table)
- `amrit-portfolio-terraform-state-prod` (S3 state bucket + state files)

### GitHub Secrets Configuration

The CI/CD pipeline authenticates using these GitHub repository secrets, which must point to the `amrit990` account:

| Secret Name             | Purpose                                           |
| ----------------------- | ------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | IAM access key for the `amrit990` `terraformuser` |
| `AWS_SECRET_ACCESS_KEY` | IAM secret key for the `amrit990` `terraformuser` |
| `AWS_REGION`            | Deployment region (`us-east-1`)                   |

---

## 5. Handling CI/CD State Loss & Orphaned Resources

### The Problem

If a CI/CD job crashes during its initial run (before Terraform successfully writes the remote state), it may leave behind physical "orphaned" resources in the AWS account that are **not tracked** in the `terraform.tfstate`.

### Symptoms

When the pipeline re-runs, Terraform attempts to create these resources fresh and encounters collision errors:

```
Error: creating DynamoDB Table (amrit-portfolio-prod-blogs): ResourceInUseException: Table already exists
Error: creating IAM Role (amrit-portfolio-prod-lambda-role): EntityAlreadyExists
```

### Recovery Protocol

1. **Identify** the orphaned resources by listing them via the AWS CLI:

   ```bash
   aws dynamodb list-tables --profile amrit990
   aws lambda list-functions --profile amrit990
   aws iam list-roles --profile amrit990 --query "Roles[?starts_with(RoleName, 'amrit-')]"
   aws apigatewayv2 get-apis --profile amrit990
   ```

2. **Delete** each orphaned resource in dependency order:

   - API Gateway (no dependencies)
   - Lambda function (depends on IAM role, but can be deleted first)
   - IAM inline policies → IAM attached policies → IAM role
   - DynamoDB table

3. **Re-trigger** the pipeline by pushing a new commit or re-running the workflow via `gh run rerun <run-id>`.

---

## 6. Terraform Resource Inventory

### Backend Module (`infra/modules/backend/`)

All backend resources are **freshly created** by Terraform on the first successful `apply`:

| Resource Type                    | Terraform Address                                       | AWS Resource                       |
| -------------------------------- | ------------------------------------------------------- | ---------------------------------- |
| DynamoDB Table                   | `aws_dynamodb_table.blogs_table`                        | `amrit-portfolio-prod-blogs`       |
| IAM Role                         | `aws_iam_role.lambda_exec_role`                         | `amrit-portfolio-prod-lambda-role` |
| IAM Policy Attachment            | `aws_iam_role_policy_attachment.lambda_basic_execution` | `AWSLambdaBasicExecutionRole`      |
| IAM Inline Policy                | `aws_iam_role_policy.dynamodb_read_policy`              | `amrit-portfolio-dynamodb-policy`  |
| Lambda Function                  | `aws_lambda_function.api_lambda`                        | `amrit-portfolio-prod-api`         |
| API Gateway (HTTP)               | `aws_apigatewayv2_api.http_api`                         | `amrit-portfolio-prod-http-api`    |
| API GW Integration               | `aws_apigatewayv2_integration.lambda_integration`       | Lambda proxy integration           |
| API GW Route (GET /blogs)        | `aws_apigatewayv2_route.get_blogs`                      | `GET /blogs`                       |
| API GW Route (POST /blogs)       | `aws_apigatewayv2_route.post_blogs`                     | `POST /blogs`                      |
| API GW Route (GET /blogs/{slug}) | `aws_apigatewayv2_route.get_blog_by_slug`               | `GET /blogs/{slug}`                |
| API GW Stage                     | `aws_apigatewayv2_stage.default`                        | `$default` (auto-deploy)           |
| Lambda Permission                | `aws_lambda_permission.api_gw`                          | API Gateway invoke permission      |

### Frontend Module (`infra/modules/frontend/`)

Frontend resources are **imported** from pre-existing AWS infrastructure using `import` blocks in `infra/modules/frontend/imports.tf`:

| Resource Type           | Terraform Address                                       | AWS Resource ID                                                                       | Import Status        |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| Route53 Hosted Zone     | `aws_route53_zone.main`                                 | `Z005277622XOKOCOMUSV2`                                                               | ✅ Imported          |
| S3 Bucket               | `aws_s3_bucket.frontend_bucket`                         | `amrit.cloud`                                                                         | ✅ Imported          |
| S3 Public Access Block  | `aws_s3_bucket_public_access_block.frontend_bucket_pab` | `amrit.cloud`                                                                         | ✅ Imported          |
| CloudFront OAC          | `aws_cloudfront_origin_access_control.default`          | `E1NWVKWK4KTVFK`                                                                      | ✅ Imported          |
| CloudFront Distribution | `aws_cloudfront_distribution.cdn`                       | `E16Z465ZCRUYRV`                                                                      | ✅ Imported          |
| ACM Certificate         | `aws_acm_certificate.cert`                              | `arn:aws:acm:us-east-1:767397976993:certificate/f327e882-69b0-44d8-8bff-237b29b39855` | ✅ Imported          |
| S3 Bucket Policy        | `aws_s3_bucket_policy.cloudfront_policy`                | —                                                                                     | Created by Terraform |
| ACM Validation Records  | `aws_route53_record.cert_validation`                    | —                                                                                     | Created by Terraform |
| ACM Validation          | `aws_acm_certificate_validation.cert_validation`        | —                                                                                     | Created by Terraform |
| Route53 A Record (root) | `aws_route53_record.root_a`                             | —                                                                                     | Created by Terraform |
| Route53 A Record (www)  | `aws_route53_record.www_a`                              | —                                                                                     | Created by Terraform |

### Pre-Requisite Resources (Not Managed by Terraform)

These resources must exist _before_ Terraform runs. They are the infrastructure that Terraform itself depends on:

| Resource                                        | AWS Service    | Purpose                                 |
| ----------------------------------------------- | -------------- | --------------------------------------- |
| `amrit-portfolio-terraform-state-prod-amrit990` | S3 Bucket      | Stores `terraform.tfstate` remotely     |
| `amrit-portfolio-terraform-locks-amrit990`      | DynamoDB Table | Prevents concurrent state modifications |
| `terraformuser` IAM User                        | IAM            | Provides AWS credentials for CI/CD      |
