# CI/CD & GitOps Architecture

This document outlines the Continuous Integration and Continuous Deployment (CI/CD) pipelines configured for this portfolio project using GitHub Actions.

## 1. Frontend CI/CD (React & S3)

**Workflow File:** `.github/workflows/deploy-to-s3.yml`

This workflow automatically deploys the React frontend application to the AWS S3 Bucket.

- **Trigger**: Runs automatically whenever a commit is pushed or merged to the `main` branch.
- **Process**:
  1. Checks out the repository.
  2. Sets up Node.js v18 and installs dependencies (`npm ci`).
  3. Builds the production React bundle (`npm run build`).
  4. Authenticates with AWS using standard GitHub Secrets (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`).
  5. Syncs the `build/` directory directly to the S3 bucket (`s3://amrit.cloud`).

## 2. Infrastructure CI/CD (GitOps & Terragrunt)

**Workflow Files:** `.github/workflows/infra-plan.yml` and `.github/workflows/infra-apply.yml`

The AWS infrastructure (API Gateway, DynamoDB, Lambda, CloudFront, Route53) is managed via Terraform and Terragrunt using a strict **GitOps** approach. This guarantees that the `main` branch is the single source of truth for all infrastructure.

### The Pull Request Flow (Plan)

- **Trigger**: Runs automatically whenever a Pull Request is opened or updated targeting the `main` branch (and modifies files in the `infra/` directory).
- **Process**:
  - Automatically installs the correct versions of Terraform (v1.5.0) and Terragrunt (v0.53.8).
  - Navigates to both the backend and frontend modules.
  - Executes `terragrunt plan` to verify the syntax and output exactly which AWS resources will be created, modified, or destroyed.
- **Safety**: This step is purely dry-run and strictly read-only. It allows developers to safely review infrastructure changes before approving the PR.

### The Merge Flow (Apply)

- **Trigger**: Runs automatically whenever code is successfully merged into the `main` branch.
- **Process**:
  - Re-authenticates with AWS and re-installs Terraform/Terragrunt.
  - Executes `terragrunt apply -auto-approve` for the Backend architecture.
  - Executes `terragrunt apply -auto-approve` for the Frontend architecture.
- **Automation**: Instantly provisions or updates the live AWS cloud resources without any manual intervention from the developer's local terminal.

## 3. Remote State Backend (S3)

To ensure that Terraform can safely execute in an ephemeral GitHub Actions runner without losing its state, the CI/CD pipeline uses a **Remote State Backend**.

- **Storage**: The state file (`terraform.tfstate`) is securely stored in an AWS S3 Bucket (`amrit-portfolio-terraform-state-prod`).
- **Locking**: An AWS DynamoDB table (`amrit-portfolio-terraform-locks`) acts as a locking mechanism. This ensures that if two CI/CD jobs run concurrently, one will gracefully wait for the other to finish, preventing state corruption.
- **Dynamic Configuration**: Terragrunt dynamically generates this `backend.tf` configuration in both the Frontend and Backend modules via a shared `common.hcl` root configuration file.
