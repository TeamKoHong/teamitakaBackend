# Step 2 - API Contracts & Swagger Plan

## A) Authorization Code + PKCE (Redirect)
- GET `/api/auth/google` → 302 to Google with state & PKCE (no body)
- GET `/api/auth/google/callback?code&state` → server exchanges code, validates state/PKCE
  - 200 (JSON) `{ message: "login success", token?: string }` OR sets HttpOnly cookie
  - 401 invalid state/code; 503 provider unavailable

## B) ID Token Verification (Backend Only)
- POST `/api/auth/google/token`
  - body: `{ id_token: string }`
  - 200: `{ message: "login success", token: string }`
  - 400: missing token; 401: invalid token/aud/iss/exp; 503 provider unavailable

## Shared Output
- JWT claims: `{ userId, email, provider: 'GOOGLE'|'LOCAL', username?, avatar? }`
- On first login: upsert user, set `provider=GOOGLE`, store `google_id`, `profileImageUrl` if provided

## Error Model (standardized)
```json
{ "code": "Unauthorized", "message": "invalid google token", "details": {} }
```

## Swagger Updates (no code changes yet)
- Paths: add the endpoint(s) above under `tags: [Auth]`
- Schemas: `GoogleIdTokenRequest`, `AuthSuccessResponse`, `AuthError`
- Examples for dev/stage URLs
- Security note: cookie vs bearer token documented

## Acceptance Criteria
- Endpoint shapes frozen
- Error codes & payloads defined
- Swagger change list approved