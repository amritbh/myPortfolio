# Historical Architectural Decisions & Context

_This document serves as an archive of significant architectural challenges, fixes, and optimizations applied to the `amrit.cloud` portfolio infrastructure over its lifecycle._

---

## 1. CloudFront SPA Routing Configuration (Fixing 403 Access Denied)

Because the portfolio is a Single Page Application (SPA) built with React, routing (like `/education` or `/experience`) is handled on the client-side. When a user navigates directly to a sub-route (or refreshes the page), the browser requests that specific file path from CloudFront/S3. Since these sub-directories don't actually exist in the S3 bucket (only `index.html` exists), S3 returns a `403 Access Denied` or `404 Not Found` error.

**The Fix Implemented:**
To resolve this, a Custom Error Response was configured directly within the Amazon CloudFront distribution:

- **HTTP Error Code**: `403: Forbidden` (and optionally `404: Not Found`)
- **Customize Error Response**: Enabled
- **Response Page Path**: `/index.html`
- **HTTP Response Code**: `200: OK`

_Result_: Now, whenever a user visits a direct link like `amrit.cloud/education`, CloudFront intercepts the `403/404` error from S3, silently returns `/index.html` with a `200 OK` status, and allows React Router to seamlessly take over and render the correct page component on the client side.

---

## 2. Subdomain (`www`) Consolidation

Initially, the architecture utilized two separate S3 buckets (`amrit.cloud` and `www.amrit.cloud`). This was redundant and caused the `www` subdomain to serve stale content because the CI/CD pipeline only deployed to the root bucket.

**The Fix Implemented:**
To simplify the architecture, save costs, and ensure both domains serve the latest deployments:

1. **S3 Bucket Deletion**: The outdated `www.amrit.cloud` S3 bucket was emptied and permanently deleted.
2. **CloudFront CNAME Addition**: The `www.amrit.cloud` subdomain was added as an **Alternate Domain Name (CNAME)** to the primary `amrit.cloud` CloudFront distribution.
3. **SSL Certificate (ACM)**: Ensured the SSL certificate attached to CloudFront covers both `amrit.cloud` and `www.amrit.cloud` (or `*.amrit.cloud`).
4. **Route 53 DNS Update**: The `www.amrit.cloud` Alias (A) record in Route 53 was updated to point to the exact same CloudFront distribution as the root domain.

_Result_: Both `amrit.cloud` and `www.amrit.cloud` now route through the single CloudFront distribution and fetch assets from the single, continuously deployed `amrit.cloud` S3 origin bucket.

---

## 3. Cost Analysis and Domain Strategy

The infrastructure is designed to be highly cost-effective, but the domain registrar renewal costs were identified as an area for optimization.

### Optimization Strategy: Transfer to AWS Route 53

To optimize costs while maintaining a professional, all-in-one cloud architecture, the recommended strategy is to **transfer the domain registrar from Namecheap to AWS Route 53**.

- **Cost Savings**: Route 53 typically renews `.cloud` domains for ~$25/year, yielding an immediate saving of ~$8/year compared to Namecheap.
- **Architecture Benefits**: Managing the Registrar, DNS (Route 53), CDN (CloudFront), and Storage (S3) entirely within a single AWS account is architecturally cleaner and serves as an excellent talking point for DevOps/Cloud Engineering interviews.

### ✅ Action Completed

On **July 3, 2026**, the domain registrar transfer for `amrit.cloud` from Namecheap to **AWS Route 53** was successfully executed and completed.

As a result:

- The domain is now 100% managed inside AWS (Registrar + DNS).
- The annual renewal cost has been significantly reduced.
- The next renewal date has been safely extended by 1 full year on top of the original expiration date.

---

## 4. Repository Cleanup and Personalization

The repository originally started as a fork of `saadpasta/developerFolio`. Several steps were taken to clean it up and ensure it represents a personalized brand:

- **README.md Replacement**: The entire README was rewritten to serve as a clean, professional introduction to Amrit Bhattarai's portfolio, removing all traces of the original author, badges, and contributors table.
- **Removed Irrelevant Files**: Deleted `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` as this is a personal portfolio, not an open-source community project.
- **Data Sanitization**: Cleaned up the local JSON files (`issues.json` and `pull_requests.json`) within `src/shared/opensource/` to remove the original author's open-source history, ensuring the Open Source page only displays relevant data.
- **Removed Docker Files**: Deleted obsolete `Dockerfile` and `docker-compose.yaml` files, as the architecture is entirely Serverless (S3/Lambda) and does not utilize containerization.

---

## 5. OWASP ZAP Baseline Scan (DAST) Artifact API Conflict

During the integration of the OWASP ZAP Baseline Scanner (`zaproxy/action-baseline`) into the CI/CD pipeline, a critical failure occurred during the artifact upload phase:

`Create Artifact Container failed: The artifact name zapreport is not valid.`

**The Root Cause:**
The CI/CD pipeline runs on modern GitHub Actions runners (`ubuntu-latest` defaulting to Node 20+). However, older versions of the ZAP Action (`v0.12.0`) relied on a deprecated version of the `@actions/artifact` library (v3). This older library is incompatible with GitHub's new v4 Artifact API infrastructure, causing the platform to outright reject the artifact upload.

**The Fix Implemented:**
To resolve this without disabling artifact generation:

1. **Action Upgrade**: Upgraded `zaproxy/action-baseline` from `v0.12.0` to `v0.15.0`, which natively supports the modern GitHub Actions v4 artifact infrastructure.
2. **Permissions**: Explicitly granted `actions: write` and `issues: write` permissions to the `ci-cd.yml` workflow, allowing ZAP to upload the HTML report and automatically generate GitHub Issues for discovered vulnerabilities.

---

## 6. Contact Page Redesign & Data Sanitization

The `/contact` page was overhauled to deliver a modern, high-converting portfolio experience:

- **Two-Column Glassmorphism Layout**: Transformed the stacked layout into a sleek two-column grid (Info Card on the left with avatar, email, location; Form Card on the right with custom styled inputs and animated submit button).
- **Address & Contact Info Update**: Updated location details to Corvallis, OR (`960 SW Washington Ave, Apt 234A, Box 65, Corvallis, OR 97333`).
- **Social Link Cleanup**: Removed Facebook and Instagram from `portfolio.js`, streamlining the social profile icons to relevant professional networks (GitHub, LinkedIn, YouTube, X, Gmail).
- **Header Layout & Navigation**: Reduced nav item horizontal padding and set `flex-wrap: nowrap` to ensure "Contact Me" stays on a single line in the header navigation bar.

---

## 7. SonarQube Cloud Security & Quality Gate Compliance

To maintain a strict Quality Gate on SonarCloud for all Pull Requests and merges to `main`:

- **Code Coverage (86.7% > 80% Requirement)**: Added `src/pages/contact/ContactComponent.test.js` using `@testing-library/react` and `jest` to thoroughly test component rendering, form validation, API submission success, and network error handling.
- **Code Duplication (0.1% < 3.0% Requirement)**: Deleted the obsolete `src/components/contactUs/ContactUs.jsx` component that contained duplicate form validation logic.
- **Security Rating (Achieved Grade A)**:
  - Replaced `Math.random()` with `window.crypto.getRandomValues()` to eliminate OWASP/SonarQube Rule S2245 (Insecure Pseudorandom Number Generator).
  - Updated all external links (`target="_blank"`) across `Button.js`, `TalkCard.js`, `PullRequestCard.js`, `IssueCard.js`, and `DegreeCard.js` to include `rel="noreferrer noopener"`, eliminating Reverse Tabnabbing vulnerabilities (Rule S5144).
  - Replaced hardcoded API Gateway URLs with `process.env.REACT_APP_CUSTOM_API_URL` and `process.env.REACT_APP_API_URL` environment variables.

---

## 8. OWASP ZAP Automation Framework Compatibility

During the deployment pipeline run on `main`, the OWASP ZAP Baseline Scan step failed with:
`Failed to access summary file /home/zap/zap_out.json`
`Error: The process '/usr/bin/docker' failed with exit code 3`

**The Fix Implemented:**
Added `cmd_options: '-a'` to `zaproxy/action-baseline@v0.15.0' in`.github/workflows/ci-cd.yml`. This instructs ZAP to run in standard scan mode (including alpha passive rules) without failing on the Automation Framework JSON summary file, allowing the deployment pipeline to run to 100% completion.
