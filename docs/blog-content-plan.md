# Blog Content Plan — AWS, Terraform & Architecture Design

A detailed plan for writing technical blog posts on your portfolio at [amrit.cloud/blogs](https://amrit.cloud/blogs). Each blog follows the same rich style as your Medium article, with architecture diagrams, code snippets, step-by-step walkthroughs, and real-world context from your own projects.

---

## Content Strategy

| Attribute                   | Detail                                                        |
| --------------------------- | ------------------------------------------------------------- |
| **Target cadence**          | 1 blog every 2 weeks                                          |
| **Format**                  | Markdown (rendered by `BlogDetail.js` using `marked`)         |
| **Supported features**      | Headings, code blocks, images, blockquotes, inline formatting |
| **Publishing workflow**     | Admin Dashboard → Create/Edit → Publish                       |
| **Estimated series length** | 13 blogs across 3 phases                                      |

---

## Phase 1 — Foundational AWS & Serverless (Blogs 1–5)

### Blog 1: "How I Built a Serverless Portfolio on AWS — From Zero to Production"

- **Tags**: `AWS`, `Serverless`, `S3`, `CloudFront`, `Route53`
- **Read Time**: ~12 min
- **Topics**: S3 static hosting, CloudFront CDN, Route53 DNS, ACM SSL, CI/CD with GitHub Actions

### Blog 2: "Building a Serverless REST API with API Gateway, Lambda & DynamoDB"

- **Tags**: `AWS`, `Lambda`, `API Gateway`, `DynamoDB`, `Python`
- **Read Time**: ~15 min
- **Topics**: DynamoDB table design, Lambda CRUD, API Gateway config, IAM roles

### Blog 3: "User Authentication with AWS Cognito — Sign Up, Sign In, and Beyond"

- **Tags**: `AWS`, `Cognito`, `Authentication`, `Security`
- **Read Time**: ~12 min
- **Topics**: User pools, email verification, JWT tokens, Google OAuth

### Blog 4: "Sending Transactional Emails from AWS — SES, Lambda & Beyond"

- **Tags**: `AWS`, `SES`, `Lambda`, `Email`
- **Read Time**: ~8 min
- **Topics**: SES domain verification, Lambda email handler, contact form integration

### Blog 5: "Building a Custom Markdown CMS — S3 Presigned URLs, CloudFront, and React"

- **Tags**: `React`, `AWS`, `S3`, `CloudFront`, `CMS`
- **Read Time**: ~14 min
- **Topics**: Generating presigned URLs in Lambda, direct-to-S3 drag-and-drop media uploads, CloudFront caching, React Markdown editor UI

---

## Phase 2 — Infrastructure as Code (Blogs 6–9)

### Blog 6: "Terraform for Beginners — Infrastructure as Code That Actually Makes Sense"

- **Tags**: `Terraform`, `IaC`, `DevOps`, `AWS`
- **Read Time**: ~14 min

### Blog 7: "Terragrunt — DRY Terraform at Scale"

- **Tags**: `Terragrunt`, `Terraform`, `IaC`, `DevOps`
- **Read Time**: ~12 min

### Blog 8: "Terraform Testing — How to Validate Your Infrastructure Before It Breaks Production"

- **Tags**: `Terraform`, `Testing`, `DevOps`, `CI/CD`
- **Read Time**: ~10 min

### Blog 9: "Managing Terraform State Like a Pro"

- **Tags**: `Terraform`, `State Management`, `AWS`, `DevOps`
- **Read Time**: ~10 min

---

## Phase 3 — Architecture & Design Patterns (Blogs 10–13)

### Blog 10: "Designing a Scalable Serverless Architecture on AWS"

- **Tags**: `Architecture`, `AWS`, `Serverless`, `Design Patterns`
- **Read Time**: ~15 min

### Blog 11: "CI/CD Pipeline Design for Modern Web Applications"

- **Tags**: `CI/CD`, `GitHub Actions`, `DevOps`, `SonarCloud`
- **Read Time**: ~12 min

### Blog 12: "Microservices vs Monolith — Making the Right Architecture Decision"

- **Tags**: `Architecture`, `Microservices`, `Design Patterns`
- **Read Time**: ~10 min

### Blog 13: "The Well-Architected Framework — Building on AWS the Right Way"

- **Tags**: `AWS`, `Architecture`, `Well-Architected`, `Best Practices`
- **Read Time**: ~14 min

---

## Suggested Publishing Schedule

| Week       | Blog                                      | Phase   |
| ---------- | ----------------------------------------- | ------- |
| Week 1–2   | Blog 1: Serverless Portfolio on AWS       | Phase 1 |
| Week 3–4   | Blog 2: Serverless REST API               | Phase 1 |
| Week 5–6   | Blog 3: AWS Cognito Authentication        | Phase 1 |
| Week 7–8   | Blog 4: Transactional Emails with SES     | Phase 1 |
| Week 9–10  | Blog 5: Custom Markdown CMS & S3 Media    | Phase 1 |
| Week 11–12 | Blog 6: Terraform for Beginners           | Phase 2 |
| Week 13–14 | Blog 7: Terragrunt at Scale               | Phase 2 |
| Week 15–16 | Blog 8: Terraform Testing                 | Phase 2 |
| Week 17–18 | Blog 9: Managing Terraform State          | Phase 2 |
| Week 19–20 | Blog 10: Scalable Serverless Architecture | Phase 3 |
| Week 21–22 | Blog 11: CI/CD Pipeline Design            | Phase 3 |
| Week 23–24 | Blog 12: Microservices vs Monolith        | Phase 3 |
| Week 25–26 | Blog 13: Well-Architected Framework       | Phase 3 |
