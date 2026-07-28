# Agent Skills Reference

This document provides a quick reference for the AI agent skill files located in `.agents/skills/`. These skills encode project-specific patterns, conventions, and domain knowledge so the agent can work effectively without rediscovering them each conversation.

---

## Skills Overview

| #   | Skill                                                   | Directory                                  | Trigger                                               |
| --- | ------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------- |
| 1   | [Cognito Authentication](#1-cognito-authentication)     | `.agents/skills/cognito-auth/`             | Login, signup, auth routes, JWT, Cognito infra        |
| 2   | [AWS Backend](#2-aws-backend)                           | `.agents/skills/aws-backend/`              | app.py, API routes, DynamoDB, Lambda                  |
| 3   | [Terraform Infrastructure](#3-terraform-infrastructure) | `.agents/skills/terraform-infra/`          | Terraform modules, Terragrunt, state, infra workflows |
| 4   | [CI/CD Pipeline](#4-cicd-pipeline)                      | `.agents/skills/cicd-pipeline/`            | GitHub Actions, pipeline failures, deployment         |
| 5   | [React Component Patterns](#5-react-component-patterns) | `.agents/skills/react-component-patterns/` | New pages, components, frontend UI                    |
| 6   | [API Client Patterns](#6-api-client-patterns)           | `.agents/skills/api-client/`               | API calls, auth flows, data layer                     |
| 7   | [Portfolio Data Schema](#7-portfolio-data-schema)       | `.agents/skills/portfolio-data/`           | Portfolio content, sections, personal info            |

---

## 1. Cognito Authentication

**File:** `.agents/skills/cognito-auth/SKILL.md`

Covers the end-to-end authentication flow spanning three layers:

- **Infrastructure** — Cognito User Pool, Client, Google IdP (`cognito.tf`)
- **Backend** — Dual JWT verification: Cognito RS256 + Custom HS256 (`app.py`)
- **Frontend** — Token parsing, session management (`Login.js`, `apiClient.js`)

**Key topics:** Cognito Hosted UI implicit flow, `id_token` hash fragment parsing, `sessionStorage` session management, admin detection, mock fallbacks, known bugs from PRs #48 and #49.

---

## 2. AWS Backend

**File:** `.agents/skills/aws-backend/SKILL.md`

Documents the single-Lambda Python backend architecture:

- **Route dispatch** — `lambda_handler()` routes by `rawPath` + HTTP method (14 routes)
- **DynamoDB** — Blogs table (hash key: `slug`) and Users table (hash key: `username`)
- **Authentication** — `authenticate()` function with `__auth_error` propagation
- **Response format** — Consistent JSON with CORS headers

**Key topics:** Route map table, item schemas, admin vs user authorization, dependency packaging, testing commands.

---

## 3. Terraform Infrastructure

**File:** `.agents/skills/terraform-infra/SKILL.md`

Encodes the Terraform + Terragrunt setup:

- **Modules** — `backend/`, `frontend/`, `email/` under `infra/modules/`
- **State** — S3 backend with DynamoDB locking via `root.hcl`
- **Naming** — `${var.project_name}-${var.environment}-<resource>`
- **Versions** — Terraform `1.8.0`, Terragrunt `0.53.8`

**Key topics:** Directory structure, format/validation commands, security scanning (tfsec, Trivy), `.tftest.hcl` tests, deployment order.

---

## 4. CI/CD Pipeline

**File:** `.agents/skills/cicd-pipeline/SKILL.md`

Documents the GitHub Actions workflows:

- **`ci-cd.yml`** — Full deploy on push to `main` (2 jobs: infrastructure → frontend)
- **`infra-plan.yml`** — Terraform plan on PRs modifying `infra/**`
- **`sonar.yml`** — SonarQube code quality scanning

**Key topics:** Job dependencies, step-by-step breakdown, dynamic env var fetching from Terragrunt outputs, required secrets, common failure points.

---

## 5. React Component Patterns

**File:** `.agents/skills/react-component-patterns/SKILL.md`

Conventions for the React 16 frontend:

- **Components** — Class-based only (no hooks/functional)
- **Theming** — `styled-components` ThemeProvider, theme passed via props
- **Routing** — `react-router-dom` v5 (`Switch`, `Route` with `render` prop)
- **Styling** — Vanilla CSS with file-per-component (no modules, no Tailwind)

**Key topics:** File structure (pages/components/containers), theme object shape, 14 available themes, asset path conventions (the `assests/` typo).

---

## 6. API Client Patterns

**File:** `.agents/skills/api-client/SKILL.md`

Documents `src/utils/apiClient.js` — the single data access layer:

- **4 fetch patterns** — Public, admin-authenticated, user-authenticated, auth with double fallback
- **Mock fallback** — All functions gracefully degrade when `API_URL` is null
- **Session management** — `sessionStorage` with `getStoredToken()`, `setSession()`, `clearSession()`

**Key topics:** Return value conventions, complete function list (16 exports), `authFetch` helper, Medium RSS integration, testing requirements.

---

## 7. Portfolio Data Schema

**File:** `.agents/skills/portfolio-data/SKILL.md`

Schema reference for `src/portfolio.js` (950 lines, 12 named exports):

- `settings`, `seo`, `greeting`, `socialMediaLinks`, `skills`
- `competitiveSites`, `degrees`, `certifications`, `experience`
- `projectsHeader`, `publicationsHeader`, `publications`, `contactPageData`

**Key topics:** Object shapes with examples, icon class formats (ionicons, simple-icons, logos, fontawesome), theme configuration, image asset conventions.

---

## How Skills Work

Skills are automatically discovered from `.agents/skills/` directories. Each directory must contain a `SKILL.md` file with YAML frontmatter (`name` and `description` fields). When a user request matches a skill's name or description, the agent reads the full SKILL.md for context before proceeding.

### Adding a New Skill

1. Create a directory: `.agents/skills/<skill-name>/`
2. Create `SKILL.md` with frontmatter:
   ```yaml
   ---
   name: Skill Name
   description: When to use this skill.
   ---

   ```
3. Add detailed instructions in the markdown body
4. Optionally add `scripts/`, `examples/`, `resources/`, `references/` subdirectories
