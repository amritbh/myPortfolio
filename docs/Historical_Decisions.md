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
