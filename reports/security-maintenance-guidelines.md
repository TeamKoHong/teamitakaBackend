# Backend Security Maintenance Guidelines

## Purpose

- Preserve the accepted security baseline established in [security-remediation-pdca.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/security-remediation-pdca.md).
- Prevent regressions when backend routes, auth flows, recovery flows, uploads, or deployment settings are changed.
- Make the remaining operator-only work explicit instead of leaving it as tribal knowledge.

## Read First

1. [security-remediation-pdca.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/security-remediation-pdca.md)
2. [supabase-rls-drift-audit.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/supabase-rls-drift-audit.md)
3. [credential-rotation-checklist.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/credential-rotation-checklist.md)

## Accepted Baseline

- `/api/dev/*` is closed by default and only opens when both `ENABLE_DEV_ROUTES=true` and `DEV_ROUTE_TOKEN` are supplied in non-production.
- Registration is bound to server-owned verification evidence, not client booleans.
- Public user listing and direct creation are admin-only.
- Internal project collaboration reads are auth-protected.
- Review and evaluation responses do not expose unnecessary reviewer/reviewee emails.
- Admin routes accept a narrower token shape than user routes.
- Uploads use a service-role Supabase client instead of relying on public-write assumptions.

## Non-Negotiable Rules

### 1. Do not add public dev helpers

- No public token minting endpoints.
- No public destructive maintenance endpoints.
- No public test email/SMS endpoints.
- If a dev route is truly required, it must stay non-production only and require a second secret gate.

### 2. Do not trust the client for proof of verification

- Never trust booleans like `isSmsVerified` or `isEmailVerified`.
- Server-side verification state must be created by the server and consumed by the server.

### 3. Do not widen token scope casually

- User auth and admin auth should not share the exact same acceptance shape.
- New privileged routes should require the narrowest viable token claims.
- If you change token structure, add or update regression tests first.

### 4. Do not return or log avoidable PII

- Avoid returning user email unless the consumer genuinely needs it.
- Never log passwords, password hashes, verification codes, or full auth payloads.
- Recovery and verification flows should log minimal operational metadata only.

### 5. Do not assume Supabase RLS is your main boundary

- The Node backend uses direct DB access and service-role capabilities.
- Live dashboard/export policy state is the source of truth, not old tracked SQL alone.

## Change Checklist

When touching auth, admin, recovery, uploads, reviews, evaluations, or project collaboration:

1. Check whether the route should be public at all.
2. Check whether the response returns unnecessary email, phone, or internal IDs.
3. Check whether logs expose request payloads or secrets.
4. Check whether rate limiting is needed.
5. Add or update `tests/security.api.test.js` if the change closes or opens a security boundary.
6. Run:

```bash
git diff --check
node -c src/app.js
npm test -- --runInBand tests/security.api.test.js
```

## Deployment Checklist

Before production deploy:

1. Confirm `NODE_ENV=production`.
2. Confirm `JWT_SECRET` is set and rotated if needed.
3. Confirm `CORS_ORIGIN` or `CORS_ORIGINS` is explicitly set.
4. Confirm `ALLOW_ANY_ORIGIN` is not enabled.
5. Confirm `ENABLE_DEV_ROUTES` is not enabled.
6. Confirm old documented credentials are no longer valid.
7. Confirm live Supabase policies have been audited against [supabase-rls-drift-audit.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/supabase-rls-drift-audit.md).

## Remaining Cross-System Work

### Frontend/Auth Contract

- The frontend still persists `result.token`.
- Do not remove JSON body tokens from login/register responses until the frontend migrates to cookie-first auth.

### Supabase

- Export the live RLS policies and compare them against the permissive tracked SQL files.
- Treat any broad `USING (true)` or `FOR ALL USING (true)` policy as suspicious until justified.

### Credential Rotation

- Follow [credential-rotation-checklist.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/credential-rotation-checklist.md) after any suspected exposure.

## Regression Trigger Points

Re-run the security review whenever one of these changes:

- JWT claims or middleware
- Admin login or admin route structure
- SMS/email verification flow
- Find-ID / recovery flow
- Supabase upload/storage behavior
- Project collaboration route visibility
- Deployment environment variable setup

## Ownership Guidance

- Backend code hardening can continue inside this repository.
- Cookie-only auth migration needs coordinated frontend work.
- RLS validation and credential rotation require operator access to the deployment environment and Supabase dashboard.
