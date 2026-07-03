# amrit.cloud — Personal Portfolio

A responsive portfolio website built with React, showcasing my experience as a DevOps & Cloud Engineer.

🌐 **Live:** [www.amrit.cloud](https://www.amrit.cloud)

---

## Tech Stack

- **Frontend:** React, JavaScript, Styled Components
- **Hosting:** AWS S3 + CloudFront
- **CI/CD:** GitHub Actions → S3 Deploy on PR merge

## Sections

- About Me
- Skills & Technologies
- Work Experience
- Certifications
- Education
- Contact

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 10

### Install & Run

```bash
npm install
npm start
```

The app runs at `http://localhost:3000`.

### Production Build

```bash
npm run build
```

Output goes to the `build/` directory.

## Deployment

The site is deployed to AWS S3 and served via CloudFront. A GitHub Actions workflow (`.github/workflows/deploy-to-s3.yml`) automatically builds and syncs to S3 when a PR is merged.

## License

This project is licensed under the MIT License — see [LICENSE](./LICENSE) for details.
