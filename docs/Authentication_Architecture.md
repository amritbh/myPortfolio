# Authentication Architecture

This document outlines the authentication architecture for the Portfolio CMS dashboard. The system employs a **Hybrid Authentication Approach**, allowing administrators to sign in using either traditional email/password credentials or OAuth 2.0 Social Logins (e.g., Google) managed by AWS Cognito.

---

## 1. Overview

The authentication system protects the `/admin` dashboard and all mutating API endpoints (e.g., creating, updating, or deleting blog posts).

It supports two simultaneous authentication pathways:

1. **Custom Auth (Email & Password):** A legacy, lightweight authentication system where a single admin username and password are used to generate a symmetrically-signed (HMAC) JWT.
2. **AWS Cognito (Social Login):** A robust identity provider integrated via OAuth 2.0 (Implicit Flow) to support federated logins (currently Google). AWS Cognito issues asymmetrically-signed (RSA RS256) JWTs.

Both pathways ultimately provide a standard JWT to the frontend, which is then sent as a `Bearer` token in the `Authorization` header for all protected API requests.

---

## 2. Infrastructure (Terraform)

The authentication infrastructure is codified using Terraform in the `infra/modules/backend` module.

### AWS Cognito Configuration (`cognito.tf`)

- **User Pool (`aws_cognito_user_pool`)**: The central directory for federated users.
- **User Pool Domain (`aws_cognito_user_pool_domain`)**: A custom hosted UI domain (`amrit-portfolio-auth-prod.auth.us-east-1.amazoncognito.com`) that serves the OAuth consent and redirect endpoints.
- **User Pool Client (`aws_cognito_user_pool_client`)**: Configured to use the **Implicit Grant flow** (`response_type=token`). It allows the frontend origin (`http://localhost:3000` and `https://amrit.cloud`) as valid callback URLs. It requests `email`, `openid`, and `profile` scopes.
- **Identity Providers (`aws_cognito_identity_provider`)**: Configured with Google OAuth credentials (Client ID and Secret) to allow users to authenticate with their Google accounts.

### Backend Dependencies (`requirements.txt`)

The Python Lambda function uses `python-jose` to parse and cryptographically verify the RSA-signed JWTs emitted by AWS Cognito.

---

## 3. Frontend Authentication Flow (React)

The frontend handles the authentication UI and session management in `src/pages/login/Login.js`.

### A. Initiating Login

When the user clicks "Continue with Google", the application redirects them to the AWS Cognito Hosted UI:

```javascript
const url = `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${redirectUri}`;
window.location.href = url;
```

### B. Handling the Redirect

After a successful Google login, Cognito redirects the user back to `/login` with the token embedded in the URL hash fragment (`#id_token=...&access_token=...`).

The application automatically parses the URL hash fragment on mount:

### C. Session Management and Role-Based Redirection

If the token validates successfully:

1. The frontend derives the user's role. If the email matches the primary admin email, they are assigned `role: 'admin'`, otherwise `role: 'user'`.
2. The user profile and token are saved in `localStorage` via `apiClient.js`.
3. Admin users are redirected to the CMS (`/admin`), while standard users are redirected to the homepage (`/home`).
4. Updates the React state to `isAuthenticated: true`.
5. Clears the URL hash using `window.history.replaceState` for security and aesthetic purposes.

### C. Authenticated API Requests

For all subsequent requests to protected routes, the frontend attaches the cached token in the `Authorization` header:

```javascript
Authorization: `Bearer <token>`;
```

---

## 4. Backend Verification Flow (API Gateway + Lambda)

The backend Lambda function (`app.py`) is responsible for verifying the token before executing any privileged actions.

### A. The Hybrid Verification Middleware

The API routes are protected by a single verification step that attempts to validate the token against both systems.

```python
payload = verify_jwt(token) # 1. Try Custom HMAC validation
if not payload:
    payload = verify_cognito_jwt(token) # 2. Try Cognito RSA validation

if not payload and token != admin_password:
    return {'statusCode': 401, 'body': 'Unauthorized'}
```

### B. Custom JWT Verification

The `verify_jwt` function decodes the token using the `ADMIN_JWT_SECRET` (HMAC HS256). This handles tokens issued by the legacy email/password login route.

### C. AWS Cognito JWT Verification

The `verify_cognito_jwt` function validates tokens issued by AWS Cognito:

1. **Fetch JWKS:** It retrieves the JSON Web Key Set (JWKS) from the Cognito User Pool endpoint: `https://cognito-idp.{region}.amazonaws.com/{pool_id}/.well-known/jwks.json`. (This is cached in memory for performance).
2. **Cryptographic Validation:** It uses `python-jose`'s `jwt.decode()` method to securely verify the token's RSA RS256 signature against the public keys retrieved from the JWKS.
3. **Validation Options:** The `verify_at_hash` check is explicitly disabled because the Implicit Flow relies solely on the ID token in this architecture.
4. **Standardize Payload:** If the signature and expiration are valid, it normalizes the extracted claims (mapping `email` to `username`) and returns a standardized payload to the route handler.

---

## 5. Environment Variables

The following environment variables are required to support this architecture.

**Frontend (`.env`)**

- `REACT_APP_COGNITO_DOMAIN`: The fully qualified Cognito User Pool domain.
- `REACT_APP_COGNITO_CLIENT_ID`: The App Client ID.
- `REACT_APP_COGNITO_USER_POOL_ID`: The AWS Cognito User Pool ID.

**Backend Infrastructure (`infra/live/prod/backend`)**

- `TF_VAR_google_client_id`: The Google OAuth App Client ID.
- `TF_VAR_google_client_secret`: The Google OAuth App Client Secret.
- `TF_VAR_apple_client_id` (optional): For future Apple integration.
- `TF_VAR_github_client_id` (optional): For future GitHub integration.
