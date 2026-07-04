# Frontend Architecture & Design Documentation

## 1. The Premium Blog Redesign

The blog section was completely redesigned to replicate the aesthetic of a modern, premium Headless CMS (like Contentful or Hygraph).

### CSS Strategy

Instead of relying heavily on a CSS framework, the components use raw CSS with modern design practices:

- **Glassmorphism**: Achieved using `backdrop-filter: blur()` to create elegant frosted-glass overlays (specifically on the blog tags).
- **Masonry Grid**: A responsive `CSS Grid` is used in `BlogList` to beautifully organize the blog cards across devices.
- **Micro-Animations**: Extensive use of `transform` and `transition` for hover effects on `BlogCard` to create a tactile, dynamic feel.
- **Typography Integration**: The markdown parsing was styled to match Medium/Hashnode, prioritizing line height, responsive font sizing, and clean blockquotes/code blocks.

### Component Structure

- `BlogList`: The main layout container. Hosts the hero banner and maps the `blogs` into the grid.
- `BlogCard`: The grid item component. It is highly optimized to truncate text gracefully (using `-webkit-line-clamp`) and handle image loading.
- `BlogDetail`: The individual post view. Renders the dynamic `hero` section based on the fetched data, and uses `marked` to safely parse Markdown into HTML.

---

## 2. API Integration (Moving Away from Contentful)

The application previously relied on the Contentful SDK for blog content. This architecture was modernized to use a fully custom Python Serverless Backend deployed via AWS.

### Changes Made:

1. **Removed `contentfulClient.js`**: The legacy SDK and credentials handling were deleted.
2. **Standardized `apiClient.js`**: A centralized client is used to fetch both `fetchBlogs()` and `fetchBlogBySlug()`.
3. **Mock Fallback**: If the `REACT_APP_CUSTOM_API_URL` is missing, `apiClient` falls back to rich local mock data, ensuring the frontend is totally unblocked for developers.

### Expected Backend Schema

The React components now expect the backend to return JSON items in the following structure:

```json
{
  "slug": "unique-slug-string",
  "title": "Post Title",
  "summary": "Short description...",
  "content": "# Full markdown body",
  "publishDate": "2026-07-04T12:00:00Z",
  "readTime": "5 min read",
  "tags": ["Tag1", "Tag2"],
  "coverImage": "https://url-to-s3-image.jpg",
  "author": {
    "name": "Amrit",
    "avatar": "https://url-to-github-avatar.jpg"
  }
}
```

---

## 3. Custom Admin CMS (Serverless Dashboard)

To replace the authoring capabilities of Contentful, a bespoke `/admin` Dashboard was built directly into the React application, interfacing with the Python backend.

### Frontend Implementation (`AdminDashboard.js`)

- **Authentication**: A simple password wall protects the CMS.
- **Split-Pane Editor**: The UI features a split view with a raw text area for Markdown input on the left and a live HTML preview (parsed by `marked`) on the right.
- **Auto-Slug**: The frontend automatically generates URL-friendly slugs based on the typed title.
- **Payload Construction**: The React state formats all metadata and content into the expected JSON schema and dispatches it via `apiClient.createBlog()`.

### Backend Implementation (`app.py` & DynamoDB)

- **POST Route**: The API Gateway was updated via Terraform to route `POST /blogs` to the `create_blog()` handler.
- **Security Check**: The Lambda function validates the incoming `Authorization` header against the `ADMIN_PASSWORD` injected by Terraform.
- **Direct Insertion**: Once authorized and validated, the Lambda uses `boto3` to inject the JSON item directly into DynamoDB, instantly making the post live on the frontend grid.

---

## 4. Frontend Infrastructure (Terraform)

The frontend hosting architecture is fully managed via Terraform (`infra/modules/frontend`), completely eliminating manual AWS Console configuration.

### Fully Automated SSL (ACM & Route53)

The custom domain (`amrit.cloud`) is fully automated:

- **`aws_acm_certificate`**: Automates the provisioning of a free SSL Certificate.
- **`aws_route53_record`**: Automatically injects the DNS validation records into the Route53 Hosted Zone.
- **`aws_acm_certificate_validation`**: Halts Terraform execution until the domain is verified, automatically attaching it to CloudFront.

### Hosting (S3 & CloudFront)

- **Origin Access Control (OAC)**: Replaces legacy OAI. S3 blocks all public access and only permits traffic signed by the CloudFront distribution's OAC.
- **SPA Routing**: CloudFront natively intercepts 403 and 404 errors (caused by React Router paths) and rewrites them to return `200 OK` with `/index.html`.

---

## 5. Multi-Account GitOps & State Import

The infrastructure was consolidated from a multi-account split into a single-account deployment in `amrit990` (Account ID: `767397976993`).

### Account Consolidation

Previously, backend resources lived in the `jay` account and frontend resources in the `amrit990` account. This split was eliminated — all portfolio resources (both backend and frontend) now reside exclusively in the `amrit990` account. The `jay` account was fully cleaned of all portfolio-related resources.

### Safe Resource Adoption (`imports.tf`)

To bring the pre-existing frontend infrastructure in the `amrit990` account strictly under Terraform's GitOps control (eliminating ClickOps), we utilized Terraform 1.5+ native `import` blocks (`infra/modules/frontend/imports.tf`).

Instead of destroying and recreating critical production infrastructure, Terraform safely "adopts" the exact AWS Resource IDs into its state map:

| Resource                | Terraform Address                                       | AWS ID                                                                                |
| ----------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Route53 Hosted Zone     | `aws_route53_zone.main`                                 | `Z005277622XOKOCOMUSV2`                                                               |
| S3 Bucket               | `aws_s3_bucket.frontend_bucket`                         | `amrit.cloud`                                                                         |
| S3 Public Access Block  | `aws_s3_bucket_public_access_block.frontend_bucket_pab` | `amrit.cloud`                                                                         |
| CloudFront OAC          | `aws_cloudfront_origin_access_control.default`          | `E1NWVKWK4KTVFK`                                                                      |
| CloudFront Distribution | `aws_cloudfront_distribution.cdn`                       | `E16Z465ZCRUYRV`                                                                      |
| ACM Certificate         | `aws_acm_certificate.cert`                              | `arn:aws:acm:us-east-1:767397976993:certificate/f327e882-69b0-44d8-8bff-237b29b39855` |

### Critical ACM Integrity Fix

During the import dry-run (`terragrunt plan`), Terraform flagged a dangerous destructive action: **replacing the existing ACM Certificate**. This would have taken down HTTPS for `amrit.cloud`.

**The Cause**: The physical AWS certificate had `www.amrit.cloud` as the primary `DomainName` and `amrit.cloud` as a Subject Alternative Name (SAN). The original Terraform module had these inverted (`domain_name = "amrit.cloud"`), causing Terraform to see a mismatch and schedule a force-replacement.

**The GitOps Fix**: The `aws_acm_certificate` block in `acm.tf` was refactored to exactly match the live AWS configuration:

```hcl
resource "aws_acm_certificate" "cert" {
  domain_name               = "www.${var.domain_name}"    # Primary: www.amrit.cloud
  subject_alternative_names = [var.domain_name]           # SAN: amrit.cloud
}
```

This ensured a `0 to destroy` plan, validating the safe adoption of the live production certificate.
