# MyPortfolio — Architecture and Setup Documentation

_This document summarizes the complete setup, architecture, and CI/CD automation established for the `amrit.cloud` portfolio website, including the dynamic serverless backend._

---

## 1. Web Architecture and Traffic Flow

The portfolio utilizes a complete end-to-to AWS architecture with a decoupled React frontend and a Python serverless backend.

### Frontend Flow (Static Assets)

1. **Namecheap (Registrar)**: Registers the domain `amrit.cloud`.
2. **Amazon Route 53 (DNS)**: Manages all DNS records and routing.
3. **Amazon CloudFront (CDN)**: Caches the React application globally for high performance and enforces HTTPS.
4. **Amazon S3 (Origin)**: Hosts the compiled React static files (`index.html`, `js`, `css`).

### Backend Flow (Dynamic Blogs)

1. **API Gateway (HTTP API)**: Exposes RESTful endpoints (`/blogs`) to the React application.
2. **AWS Lambda (Python)**: Executes backend logic using `boto3` to fetch requested data.
3. **Amazon DynamoDB**: A NoSQL database storing the blog posts in a highly scalable and cost-effective table.

---

## 2. Infrastructure as Code (IaC) Deployment Guide

The entire architecture is now codified using **Terraform** and managed seamlessly via **Terragrunt** to keep environments DRY (Don't Repeat Yourself). The code lives in the `infra/` directory.

### Directory Structure

- `infra/modules/frontend`: Contains the configurations for S3, Route53, and CloudFront.
- `infra/modules/backend`: Contains the configurations for DynamoDB, Lambda, and API Gateway.
- `infra/live/prod`: The active deployment environment where Terragrunt runs.

### How it was Built & Imported

**1. The Backend (Net New)**
Because the backend was built from scratch, the deployment was a straightforward execution:

- The Terraform configuration defined the new DynamoDB table, Lambda function, and API Gateway.
- `terragrunt apply` was run from `infra/live/prod/backend` to provision the resources dynamically.

**2. The Frontend (Importing Existing Infrastructure)**
Because the frontend (S3, CloudFront, Route53) already existed and was previously deployed manually, it was adopted into Terraform using the **Import Method**:

- **Step 1:** The exact existing setup was codified in `infra/modules/frontend/main.tf`.
- **Step 2:** The AWS Managed Policies (`AmazonRoute53FullAccess`, `AmazonS3FullAccess`, etc.) were attached to the deployment user via an IAM Inline Policy.
- **Step 3:** The `terragrunt import` commands were executed to download the real-time AWS state into the local `.tfstate`:
  ```bash
  terragrunt import aws_route53_zone.main Z0052776...
  terragrunt import aws_cloudfront_distribution.cdn E16Z465...
  terragrunt import aws_s3_bucket.frontend_bucket amrit.cloud
  ```
- **Step 4:** `terragrunt apply` was run to finalize the configuration.

### Security Upgrade: S3 Origin Access Control (OAC)

During the frontend Terraform import, the security architecture was actively upgraded:

- The S3 Bucket was modified to block all public access (`aws_s3_bucket_public_access_block`).
- CloudFront was updated to use modern **Origin Access Control (OAC)** instead of the deprecated OAI or public policies.
- A strict S3 Bucket Policy was attached to only allow `s3:GetObject` requests originating specifically from the `AWS:SourceArn` of the CloudFront distribution.

---

## 3. AWS Multi-Account Configuration

Two distinct AWS profiles were configured locally to securely manage different AWS accounts without conflict.

### Configured Profiles:

1. **`jaybhole` Profile**:
   - AWS Account ID: `025064823204`
   - IAM User: `terraformuser`
2. **`amrit990` Profile**:
   - AWS Account ID: `767397976993`
   - IAM User: `bamrit` (Owns the `amrit.cloud` infrastructure)

### Local Shell Convenience Aliases (`~/.zshrc`):

Custom aliases were created to easily switch active AWS credentials in the terminal:

- `aws-jay`: Switches session to use `jaybhole` credentials (`export AWS_PROFILE=jaybhole`).
- `aws-amrit`: Switches session to use `amrit990` credentials (`export AWS_PROFILE=amrit990`).
- `aws-whoami`: Displays the currently active AWS profile and identity (`aws sts get-caller-identity`).

---

## 3. CI/CD Pipeline (GitHub Actions)

A robust Continuous Integration and Continuous Deployment (CI/CD) pipeline was configured to automate website deployments.

**Workflow File**: `.github/workflows/deploy-to-s3.yml`

### Pipeline Triggers

The workflow automatically triggers whenever a `push` occurs on the **`main`** branch. This means any code pushed directly or merged via a Pull Request will instantly kick off a deployment.

### Pipeline Execution Steps

1. **Checkout Code**: Retrieves the latest codebase from GitHub.
2. **Setup Environment**: Provisions a Node.js v18 environment and utilizes npm caching to speed up consecutive build times.
3. **Install Dependencies**: Executes a clean install of all necessary packages (`npm ci`).
4. **Build Production Bundle**: Compiles the React SPA (Single Page Application) into optimized static assets in the `build/` directory (`npm run build`).
5. **Configure AWS Credentials**: Authenticates the GitHub Action runner using the `amrit990` IAM user credentials stored securely as GitHub Secrets.
6. **Deploy to S3**: Synchronizes the newly built assets into the S3 bucket using the `aws s3 sync` command with the `--delete` flag. This ensures old files are removed and the bucket perfectly mirrors the current build.
7. **Verify Deployment**: Outputs the uploaded objects in the terminal to confirm successful synchronization. _(Note: CloudFront invalidations can also be added here to immediately clear the CDN cache)._

### GitHub Secrets Configured

The following secrets are securely stored in the GitHub repository settings:

- `AWS_ACCESS_KEY_ID`: From the `amrit990` account.
- `AWS_SECRET_ACCESS_KEY`: From the `amrit990` account.
- `AWS_REGION`: Set to `us-east-1`.

---

## 4. Repository Cleanup and Personalization

The repository originally started as a fork of `saadpasta/developerFolio`. Several steps were taken to clean it up and ensure it represents a personalized brand:

- **README.md Replacement**: The entire README was rewritten to serve as a clean, professional introduction to Amrit Bhattarai's portfolio, removing all traces of the original author, badges, and contributors table.
- **Removed Irrelevant Files**: Deleted `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` as this is a personal portfolio, not an open-source community project.
- **Domain Configuration**: Updated the `CNAME` file to `amrit.cloud` for proper domain mapping.
- **Data Sanitization**: Cleaned up the local JSON files (`issues.json` and `pull_requests.json`) within `src/shared/opensource/` to remove the original author's open-source history, ensuring the Open Source page only displays relevant data.
- **Linting & Code Fixes**: Cleaned up unused variables and imports across multiple React components (`Opensource.js`, `ContactComponent.js`, `Greeting.js`) to ensure strict CI/CD linting checks (`CI=true`) pass without failing the automated build.
- **Git Ignore Updates**: Added the `amrit.cloud/` backup folder and local `.env` files to `.gitignore` to prevent secret leakage and keep the repository tree small and clean.

---

## 5. CloudFront SPA Routing Configuration (Fixing 403 Access Denied)

Because the portfolio is a Single Page Application (SPA) built with React, routing (like `/education` or `/experience`) is handled on the client-side. When a user navigates directly to a sub-route (or refreshes the page), the browser requests that specific file path from CloudFront/S3. Since these sub-directories don't actually exist in the S3 bucket (only `index.html` exists), S3 returns a `403 Access Denied` or `404 Not Found` error.

**The Fix Implemented:**
To resolve this, a Custom Error Response was configured directly within the Amazon CloudFront distribution:

- **HTTP Error Code**: `403: Forbidden` (and optionally `404: Not Found`)
- **Customize Error Response**: Enabled
- **Response Page Path**: `/index.html`
- **HTTP Response Code**: `200: OK`

_Result_: Now, whenever a user visits a direct link like `amrit.cloud/education`, CloudFront intercepts the `403/404` error from S3, silently returns `/index.html` with a `200 OK` status, and allows React Router to seamlessly take over and render the correct page component on the client side.

---

## 6. Subdomain (`www`) Consolidation

Initially, the architecture utilized two separate S3 buckets (`amrit.cloud` and `www.amrit.cloud`). This was redundant and caused the `www` subdomain to serve stale content (from October 2025) because the CI/CD pipeline only deployed to the root bucket.

**The Fix Implemented:**
To simplify the architecture, save costs, and ensure both domains serve the latest deployments:

1. **S3 Bucket Deletion**: The outdated `www.amrit.cloud` S3 bucket was emptied and permanently deleted.
2. **CloudFront CNAME Addition**: The `www.amrit.cloud` subdomain was added as an **Alternate Domain Name (CNAME)** to the primary `amrit.cloud` CloudFront distribution.
3. **SSL Certificate (ACM)**: Ensured the SSL certificate attached to CloudFront covers both `amrit.cloud` and `www.amrit.cloud` (or `*.amrit.cloud`).
4. **Route 53 DNS Update**: The `www.amrit.cloud` Alias (A) record in Route 53 was updated to point to the exact same CloudFront distribution as the root domain.

_Result_: Both `amrit.cloud` and `www.amrit.cloud` now route through the single CloudFront distribution and fetch assets from the single, continuously deployed `amrit.cloud` S3 origin bucket.

---

## 7. Cost Analysis and Domain Strategy

The infrastructure is designed to be highly cost-effective, but the domain registrar renewal costs were identified as an area for optimization.

### Current Costs Breakdown

- **AWS Hosting ($0.51/month = ~$6.12/year)**: The $0.51 monthly cost is almost entirely the flat fee for the AWS Route 53 Hosted Zone ($0.50/month). S3 storage and CloudFront bandwidth for a personal portfolio typically cost fractions of a penny (\$0.01/month) due to the AWS Free Tier and low raw data usage.
- **Namecheap Domain (\$33.18/year)**: The `.cloud` Top-Level Domain (TLD) is a premium extension. While initial registration is often heavily discounted, Namecheap marks up the recurring renewal price significantly.

### Optimization Strategy: Transfer to AWS Route 53

To optimize costs while maintaining a professional, all-in-one cloud architecture, the recommended strategy is to **transfer the domain registrar from Namecheap to AWS Route 53**.

- **Cost Savings**: Route 53 typically renews `.cloud` domains for ~$25/year, yielding an immediate saving of ~$8/year compared to Namecheap.
- **Architecture Benefits**: Managing the Registrar, DNS (Route 53), CDN (CloudFront), and Storage (S3) entirely within a single AWS account is architecturally cleaner and serves as an excellent talking point for DevOps/Cloud Engineering interviews.

### Domain Transfer Rules (How it works)

- **No Lost Time**: When transferring a domain, you do **not** lose the time you have already paid for at Namecheap.
- **1-Year Extension**: Upon transfer, you pay the new registrar (AWS) for a 1-year extension. That 1 year is added _on top_ of your existing expiration date (e.g., if it expires April 2027, the transfer will push the expiration to April 2028).
- **Timing**: There is no financial penalty for transferring early. It is highly recommended to initiate the transfer well before the next Namecheap auto-renewal date to avoid being double-charged. The only restriction is that a domain cannot be transferred within 60 days of its initial registration or a previous transfer.

### ✅ Action Completed

On **July 3, 2026**, the domain registrar transfer for `amrit.cloud` from Namecheap to **AWS Route 53** was successfully executed and completed.

As a result:

- The domain is now 100% managed inside AWS (Registrar + DNS).
- The annual renewal cost has been significantly reduced.
- The next renewal date has been safely extended by 1 full year on top of the original expiration date.
