# Step 4 - Security & Logging Policy

## Option A (Redirect)
- Use state + PKCE
- CSRF: if session/cookie flow, protect callback
- Cookies: HttpOnly, Secure (prod), SameSite=Lax/Strict

## Option B (ID Token)
- Verify with google-auth-library: `aud`, `iss`, `exp`, `sub`
- Accept only `iss` in ["accounts.google.com", "https://accounts.google.com"]

## Common
- CORS: allow only known fronts; block `*`
- Rate limit: per IP/email for login endpoints
- Log masking: email `abc***@***`, token prefix only
- Error mapping: 400/401/429/503 consistent messages

## Acceptance Criteria
- Security checklist approved
- Masking rules enforced in implementation