---
name: CI/CD Pipeline
description: GitHub Actions workflow conventions, job dependencies, security scanning steps, and deployment process for both infrastructure and frontend. Use this skill when modifying workflows, fixing pipeline failures, or adding new CI/CD steps.
---

# CI/CD Pipeline

This project uses **GitHub Actions** with two workflows and a SonarQube integration.

## Workflow Files

| File                               | Trigger                          | Purpose                        |
| ---------------------------------- | -------------------------------- | ------------------------------ |
| `.github/workflows/ci-cd.yml`      | Push to `main`                   | Full deploy (infra + frontend) |
| `.github/workflows/infra-plan.yml` | PR to `main` (paths: `infra/**`) | Terraform plan preview         |
| `.github/workflows/sonar.yml`      | Push/PR                          | SonarQube code quality scan    |

## Main Pipeline: `ci-cd.yml`

### Job 1: `infrastructure` (Infrastructure Apply)

Runs on: `ubuntu-latest`

**Steps in order:**

1. Checkout repository
2. Setup Terraform `1.8.0` (wrapper disabled)
3. Setup Terragrunt `0.53.8` (downloaded from GitHub releases)
4. `terraform fmt -check -recursive` — format check
5. `terragrunt hclfmt --terragrunt-check` — HCL format check
6. `terragrunt run-all validate` — validation
7. **tfsec** security scanner (soft fail)
8. **Trivy** vulnerability scanner (fs mode, HIGH/CRITICAL, exit code 0)
9. Setup Python 3.9
10. **pytest + bandit** — Backend tests and security scan
11. `terraform test` — Backend module TF tests
12. `terraform test` — Frontend module TF tests
13. Package Lambda dependencies (`pip3 install -t .`)
14. `terragrunt apply` — Backend (with `-auto-approve`)
15. `terragrunt apply` — Frontend (with `-auto-approve`)

### Job 2: `frontend` (Build & Deploy)

**Depends on:** `needs: infrastructure` — only runs after infra succeeds.

Runs on: `ubuntu-latest`

**Steps in order:**

1. Checkout repository
2. Setup Node.js 18 (with npm cache)
3. Configure AWS credentials
4. Setup Terraform + Terragrunt (needed for output fetching)
5. `npm ci` — install dependencies
6. `CI=true npm run test -- --coverage` — run frontend tests
7. **Fetch dynamic env vars from Terragrunt outputs:**
   ```bash
   export REACT_APP_CUSTOM_API_URL=$(cd infra/live/prod && terragrunt output -raw api_endpoint)
   export REACT_APP_COGNITO_DOMAIN=$(cd infra/live/prod && terragrunt output -raw cognito_domain)
   export REACT_APP_COGNITO_CLIENT_ID=$(cd infra/live/prod && terragrunt output -raw cognito_client_id)
   ```
8. `npm run build` — production build with env vars baked in
9. `aws s3 sync build/ s3://amrit.cloud/ --delete` — deploy to S3
10. **CloudFront invalidation** — finds distribution by alias, invalidates `/*`
11. **Verify deployment** — lists S3 objects and counts
12. **OWASP ZAP** baseline scan (DAST) against `https://amrit.cloud`

## PR Preview: `infra-plan.yml`

Only triggered on PRs that modify files under `infra/**`.

**Steps:**

1. Checkout + Setup Terraform + Terragrunt
2. Format checks (terraform fmt + terragrunt hclfmt)
3. Validation
4. Security scans (tfsec + Trivy)
5. Python tests (pytest + bandit)
6. Terraform tests (backend + frontend modules)
7. `terragrunt plan` — Backend (saves plan to `tfplan`)
8. `terragrunt plan` — Frontend (saves plan to `tfplan`)

No `apply` step — plan only for review.

## Required GitHub Secrets

| Secret                  | Used By            | Purpose                                               |
| ----------------------- | ------------------ | ----------------------------------------------------- |
| `AWS_ACCESS_KEY_ID`     | Both jobs          | AWS authentication                                    |
| `AWS_SECRET_ACCESS_KEY` | Both jobs          | AWS authentication                                    |
| `AWS_REGION`            | Both jobs          | AWS region (us-east-1)                                |
| `GOOGLE_CLIENT_ID`      | Infrastructure job | Cognito Google IdP (as `TF_VAR_google_client_id`)     |
| `GOOGLE_CLIENT_SECRET`  | Infrastructure job | Cognito Google IdP (as `TF_VAR_google_client_secret`) |

## Key Environment Variables

| Variable                      | Set By            | Value                    |
| ----------------------------- | ----------------- | ------------------------ |
| `TERRAGRUNT_NON_INTERACTIVE`  | Workflow env      | `true`                   |
| `BUCKET`                      | Frontend job env  | `amrit.cloud`            |
| `REACT_APP_CUSTOM_API_URL`    | Terragrunt output | API Gateway endpoint     |
| `REACT_APP_COGNITO_DOMAIN`    | Terragrunt output | Cognito hosted UI domain |
| `REACT_APP_COGNITO_CLIENT_ID` | Terragrunt output | Cognito app client ID    |

## SonarQube Configuration

Config file: `sonar-project.properties`

- Project: `amritbh_myPortfolio`
- Sources: `src`, `infra/modules/backend/src`
- Test inclusions: `**/*.test.js`, `**/test_app.py`
- Coverage: JS via `coverage/lcov.info`, Python via `coverage.xml`
- Exclusions: `node_modules`, test files, `portfolio.js`

## Deployment Target

- **S3 Bucket**: `amrit.cloud`
- **CloudFront**: CDN distribution with `amrit.cloud` and `www.amrit.cloud` aliases
- **Live URL**: `https://amrit.cloud`

## ⚠️ Common Pipeline Failure Points

1. **Format check fails**: Run `terraform fmt -recursive` and `terragrunt hclfmt` locally before pushing
2. **Terragrunt output fetch fails**: Ensure backend apply completed successfully before frontend job
3. **Lambda packaging**: `pip3 install -r requirements.txt -t .` must run BEFORE the zip is created
4. **CloudFront invalidation**: Distribution lookup uses the bucket name as alias — if CNAME changes, this breaks
5. **Node 18 + React Scripts 3.2**: Requires `--openssl-legacy-provider` flag (already in package.json scripts)

## Checklist: Modifying the Pipeline

1. Test changes on a PR first (infra-plan.yml gives safe preview)
2. Ensure new steps are in the correct job (infra vs frontend)
3. If adding new Terraform outputs needed by frontend, add to both `outputs.tf` and the `Fetch` step
4. If adding new secrets, document them and add to GitHub repo settings
5. Security scan steps use `soft_fail: true` / `exit-code: '0'` — they report but don't block
