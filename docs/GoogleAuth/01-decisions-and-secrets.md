# Step 1 - Decisions & Secrets (Google Auth)

## 1) Choose OAuth Flow & Policies
- Flow option A: Authorization Code + PKCE (server handles redirect/callback). Recommended when you control redirects and want HttpOnly cookies.
- Flow option B: ID Token verification (frontend obtains id_token; backend verifies and issues our JWT). Recommended for SPA/mobile.
- Account linking policy (same email):
  - Link to existing local account (recommended) OR create new provider-specific account.
  - Conflict resolution: prefer linking if local account exists and email verified by Google.

## 2) Redirect URIs & Origins (per environment)
- Dev redirect (A only): `http://localhost:8080/api/auth/google/callback`
- Stage redirect (A only): `https://<stage-host>/api/auth/google/callback`
- Prod redirect (A only): `https://<prod-host>/api/auth/google/callback`
- Allowed origins (CORS): list frontend hosts (dev/stage/prod) and Swagger UI if needed.

## 3) Consent Screen & Scopes
- App name, support email
- Scopes: `email`, `profile` (minimal)
- Authorized domains: your frontend/backend domains
- Test users (before publishing)

## 4) Secrets & Env Vars (names and placement)
- Feature flag: `GOOGLE_LOGIN_ENABLED=true`
- Common
  - `CORS_ALLOWED_ORIGINS="https://frontend.example.com,http://localhost:5173"`
  - `COOKIE_DOMAIN=example.com` (if HttpOnly cookie on prod)
- Option A (Redirect):
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
- Option B (ID Token):
  - `GOOGLE_AUDIENCE` (same as client id)
- Placement
  - Local `.env.development`: dummy only (real secrets never in repo)
  - GitHub Actions Secrets: all of the above
  - Cloud Run env vars: prod/stage values

## 5) Acceptance Criteria
- Flow choice (A or B) approved
- Redirects & origins enumerated for all envs
- Consent screen completed (test users added)
- Secrets naming agreed and provisioning plan documented
