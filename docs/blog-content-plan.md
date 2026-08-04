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
| **Estimated series length** | 20 blogs across 4 phases                                      |

---

## Phase 1 — Foundational AWS & Serverless (Blogs 1–7)

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

### Blog 5: "The Hidden Trap of Email Deliverability: Custom Signups, Amazon SES, and DMARC" (Drafted)

- **Tags**: `AWS`, `SES`, `Auth`, `DynamoDB`, `Security`
- **Read Time**: ~15 min
- **Topics**: Building native signups, SES sandbox exit, the DMARC trap with @gmail.com, sending emails safely

### Blog 6: "Building a Custom Markdown CMS — S3 Presigned URLs, CloudFront, and React"

- **Tags**: `React`, `AWS`, `S3`, `CloudFront`, `CMS`
- **Read Time**: ~14 min
- **Topics**: Generating presigned URLs in Lambda, direct-to-S3 drag-and-drop media uploads, CloudFront caching, React Markdown editor UI

### Blog 7: "Scaling S3 Media Organization — Entity-Based Partitioning for Serverless Apps"

- **Tags**: `AWS`, `S3`, `Architecture`, `Serverless`, `Data Management`
- **Read Time**: ~10 min
- **Topics**: Why flat S3 buckets fail at scale, migrating to entity-based partitioning (e.g. by blog slug), parsing backend JSON for dynamic routing, maintaining a clean architecture as your application grows.

---

## Phase 2 — Infrastructure as Code (Blogs 8–11)

### Blog 8: "Terraform for Beginners (Infrastructure as Code That Actually Makes Sense)" (Drafted)

- **Tags**: `Terraform`, `IaC`, `DevOps`, `AWS`
- **Read Time**: ~14 min

### Blog 9: "Terragrunt — DRY Terraform at Scale"

- **Tags**: `Terragrunt`, `Terraform`, `IaC`, `DevOps`
- **Read Time**: ~12 min

### Blog 10: "Terraform Testing — How to Validate Your Infrastructure Before It Breaks Production"

- **Tags**: `Terraform`, `Testing`, `DevOps`, `CI/CD`
- **Read Time**: ~10 min

### Blog 11: "Managing Terraform State Like a Pro"

- **Tags**: `Terraform`, `State Management`, `AWS`, `DevOps`
- **Read Time**: ~10 min

---

## Phase 3 — Architecture & Design Patterns (Blogs 12–15)

### Blog 12: "Designing a Scalable Serverless Architecture on AWS"

- **Tags**: `Architecture`, `AWS`, `Serverless`, `Design Patterns`
- **Read Time**: ~15 min

### Blog 13: "CI/CD Pipeline Design for Modern Web Applications"

- **Tags**: `CI/CD`, `GitHub Actions`, `DevOps`, `SonarCloud`
- **Read Time**: ~12 min

### Blog 14: "Microservices vs Monolith — Making the Right Architecture Decision"

- **Tags**: `Architecture`, `Microservices`, `Design Patterns`
- **Read Time**: ~10 min

### Blog 15: "The Well-Architected Framework — Building on AWS the Right Way"

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
| Week 9–10  | Blog 6: Custom Markdown CMS & S3 Media    | Phase 1 |
| Week 11-12 | Blog 7: Scaling S3 Media Organization     | Phase 1 |
| Week 13-14 | Blog 8: Terraform for Beginners           | Phase 2 |
| Week 15-16 | Blog 9: Terragrunt at Scale               | Phase 2 |
| Week 17-18 | Blog 10: Terraform Testing                | Phase 2 |
| Week 19-20 | Blog 11: Managing Terraform State         | Phase 2 |
| Week 21-22 | Blog 12: Scalable Serverless Architecture | Phase 3 |
| Week 23-24 | Blog 13: CI/CD Pipeline Design            | Phase 3 |
| Week 25-26 | Blog 14: Microservices vs Monolith        | Phase 3 |
| Week 27-28 | Blog 15: Well-Architected Framework       | Phase 3 |
| Week 29-30 | Blog 16: Redesign Series Part 1           | Phase 4 |
| Week 31-32 | Blog 17: Redesign Series Part 2           | Phase 4 |
| Week 33-34 | Blog 18: Redesign Series Part 3           | Phase 4 |
| Week 35-36 | Blog 19: Redesign Series Part 4           | Phase 4 |
| Week 37-38 | Blog 20: Redesign Series Part 5           | Phase 4 |

---

## Phase 4 — Landing Page Redesign Series (Blogs 16–20)

This phase documents the full redesign of amrit.cloud as a live engineering case study.
Each blog maps to one sprint and is written after the sprint's PR is merged.
The series doubles as a showcase of frontend engineering, UX decision-making, and React patterns.

### Blog 16: "How I Redesigned My Portfolio Landing Page (Sprint 1: Dark Mode Done Right)"

- **Slug**: `redesign-s1-dark-mode-theme-switcher`
- **Tags**: `React`, `Frontend`, `UX`, `Dark Mode`, `JavaScript`
- **Read Time**: ~10 min
- **Publish after**: Sprint 1 PR merged
- **Topics**:
  - Why the hardcoded `chosenTheme` pattern breaks and how to fix it with state-driven theming
  - Building a 3-mode pill switcher (Light, System, Dark) from scratch in React 16 class components
  - Reading `prefers-color-scheme` with `window.matchMedia` and listening for live OS changes
  - Persisting theme preference in `localStorage` without any external state library
  - Designing the dark theme palette: why GitHub-dark (`#0D1117`) beats flat black
  - Testing theme switching with Jest and `@testing-library/react`
  - Code walkthrough of `App.js`, `ThemeSwitcher.js`, and the prop-flow through `Main.js`

### Blog 17: "Redesigning the Hero Section (Sprint 2: First Impressions Matter)"

- **Slug**: `redesign-s2-hero-section`
- **Tags**: `React`, `CSS`, `UX`, `Frontend`, `Design`
- **Read Time**: ~12 min
- **Publish after**: Sprint 2 PR merged
- **Topics**:
  - Why a flat name and subtitle is not enough: what makes a hero section convert
  - Designing a split-screen hero: layout decisions, visual hierarchy, whitespace
  - Gradient text in CSS: `background-clip: text` and `-webkit-text-fill-color: transparent`
  - Animating identity chips sequentially with CSS `nth-child` animation delays
  - Profile photo with an animated Nepal-flag-inspired gradient ring using `conic-gradient`
  - Animated count-up stats bar on scroll intersection
  - Writing a compelling personal intro (Nepal born, Oregon based, cloud architect)
  - Making it fully responsive without a CSS framework

### Blog 18: "Adding a Blog Preview and Travel Teaser to the Home Page (Sprint 3)"

- **Slug**: `redesign-s3-blog-preview-travel-teaser`
- **Tags**: `React`, `Frontend`, `API`, `UX`, `Travel`
- **Read Time**: ~10 min
- **Publish after**: Sprint 3 PR merged
- **Topics**:
  - Why surfacing content on the landing page reduces friction and increases engagement
  - Building a `FeaturedBlogs` component: skeleton loading states, 3-column CSS grid, graceful error handling
  - Reusing the existing `fetchBlogs()` API client in a new context
  - Creating the `TravelTeaser` section: introducing a travel identity to a tech portfolio
  - Design choices: destination chips, Nepal vs USA split cards, motorcycling strip
  - Mountain silhouette SVG background: inline SVG with theme-aware opacity
  - Data-driven design: adding `travelData` to `portfolio.js` and consuming it in components

### Blog 19: "Building the Travel Page and Redesigning the Footer (Sprint 4)"

- **Slug**: `redesign-s4-travel-page-footer`
- **Tags**: `React`, `Frontend`, `Travel`, `Nepal`, `UX`
- **Read Time**: ~11 min
- **Publish after**: Sprint 4 PR merged
- **Topics**:
  - Creating a new React route `/travel` from scratch: from `Main.js` to page component
  - Structuring the travel page: Nepal treks, motorcycling, USA travel, and a Nepal tourism support message
  - The 7 Himalayan trek destinations and why I want to document them (ABC, Tilicho, Gosaikunda, Mustang, Pokhara, Badimalika, Aama Yangri)
  - Why I chose `/travel` over `travel.amrit.cloud` (SEO, infra cost, audience size reasoning)
  - Building a newsletter signup UI in the footer without any backend (yet)
  - Enhanced footer: quick links, social icons, and copyright in a clean 3-row layout
  - Wiring up the "Coming Soon" subscriber experience

### Blog 20: "Migrating from CRA to Vite and JavaScript to TypeScript (Sprint 5)"

- **Slug**: `redesign-s5-vite-typescript-migration`
- **Tags**: `TypeScript`, `Vite`, `React 18`, `Frontend`, `Migration`
- **Read Time**: ~15 min
- **Publish after**: Sprint 5 PR merged
- **Topics**:
  - Why CRA is deprecated and why Vite is the right replacement in 2026
  - The case for TypeScript: what silent bugs it would have caught in this portfolio
  - Step-by-step migration: `vite.config.ts`, `tsconfig.json`, renaming files, typing props
  - Converting class components to functional components with hooks: a practical guide
  - Shared type interfaces: `Theme`, `Blog`, `GreetingData`, `TravelData` in `src/types/index.ts`
  - Migrating from Jest to Vitest: near-identical API, zero config
  - Removing the `--openssl-legacy-provider` workaround for good
  - CI/CD pipeline changes and final production build verification
