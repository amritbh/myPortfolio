# amrit.cloud — Personal Portfolio

A highly scalable, secure, and responsive portfolio website built with React, showcasing my experience as a DevOps & Cloud Engineer.

🌐 **Live:** [www.amrit.cloud](https://www.amrit.cloud)

---

## 🛠 Tech Stack

This project is not just a static webpage—it is a fully engineered cloud application utilizing modern Serverless and Infrastructure as Code (IaC) principles.

- **Frontend:** React, JavaScript, Styled Components (Hosted on AWS S3 & CloudFront)
- **Backend:** AWS Lambda (Python), API Gateway v2, DynamoDB
- **Infrastructure as Code:** Terraform & Terragrunt
- **Testing & Quality:** Jest, Pytest, Moto
- **Security & SAST/DAST:** SonarCloud, Bandit, Trivy, OWASP ZAP Baseline
- **CI/CD:** Fully automated via GitHub Actions

---

## 📚 Architecture Documentation

The complete technical design and infrastructure of this project is deeply documented in the `docs/` directory.

- **[CI/CD & Security Architecture](docs/CICD_Architecture.md):** Details the automated deployment pipelines, security scans (Trivy/Bandit/ZAP), and SonarCloud integration.
- **[Backend Architecture](docs/Backend_Architecture.md):** Details the Serverless Python API, DynamoDB schema, and Pytest mocking strategy.
- **[Frontend Architecture](docs/Frontend_Architecture.md):** Details the React component structure, dynamic API integration, and Jest testing framework.
- **[Historical Decisions](docs/Historical_Decisions.md):** A log of architectural choices made during development, such as CloudFront SPA routing fixes and Route53 domain transfers.

---

## 🚀 Getting Started Locally

### Prerequisites

- Node.js ≥ 18
- Python ≥ 3.9
- Terraform v1.8.0 & Terragrunt

### 1. Run the Frontend Locally

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

### 2. Run the Tests

```bash
# Frontend Tests & Coverage (Jest)
CI=true npm run test -- --coverage

# Backend Tests & Coverage (Pytest)
cd infra/modules/backend/src
pip install -r requirements-test.txt
python -m pytest --cov=.
```

---

## ☁️ Deployment

The infrastructure and application code are continuously deployed via GitHub Actions:

- **Application Code:** Pushing to `main` triggers `.github/workflows/ci-cd.yml` which tests and deploys the React frontend immediately (only if infrastructure deployment succeeds).
- **Infrastructure Code:** Pull Requests touching `infra/` trigger Terraform validation and tests. Merging triggers `.github/workflows/ci-cd.yml` to automatically provision or update the AWS resources (Lambda, DynamoDB, API Gateway, S3, CloudFront).

---

## 📄 License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.
