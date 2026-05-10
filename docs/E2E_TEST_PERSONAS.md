# E2E Test Personas

This harness creates cleanup-safe test accounts and baseline data for real user-flow testing.

## Personas

Default namespace: `e2e_20260510`

Default password: `TeamitakaE2E!2026`

- `e2e_20260510_owner@test.teamitaka.local`
- `e2e_20260510_applicant_a@test.teamitaka.local`
- `e2e_20260510_applicant_b@test.teamitaka.local`
- `e2e_20260510_member_a@test.teamitaka.local`
- `e2e_20260510_member_b@test.teamitaka.local`

All personas are verified members in the same university so simulator flows can test school-scoped recruiting.

## Data Created

- One active recruitment for applicant submission.
- One active recruitment with pending applications for owner-side applicant selection.
- One active project with project members, todos, meeting notes, and schedule.
- One completed project with partial reviews for evaluation pending/submitted states.

## Commands

Local or staging DB:

```bash
npm run e2e:personas:status -- --namespace=e2e_20260510
npm run e2e:personas:up -- --namespace=e2e_20260510
npm run e2e:personas:down -- --namespace=e2e_20260510
```

Supabase/shared production-like DB must be explicit:

```bash
NODE_ENV=production TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
  npx dotenv -e env.supabase -- \
  node scripts/e2e/seed-test-personas.js up --namespace=e2e_20260510 --confirm-production
```

If direct DB password auth is unavailable but `SUPABASE_SERVICE_KEY` is valid, use the PostgREST service-key fallback:

```bash
NODE_ENV=production TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
  npx dotenv -e env.supabase -- \
  node scripts/e2e/seed-test-personas-supabase.js up --namespace=e2e_20260510 --confirm-production
```

Cleanup:

```bash
NODE_ENV=production TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
  npx dotenv -e env.supabase -- \
  node scripts/e2e/seed-test-personas.js down --namespace=e2e_20260510 --confirm-production
```

Supabase service-key cleanup:

```bash
NODE_ENV=production TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
  npx dotenv -e env.supabase -- \
  node scripts/e2e/seed-test-personas-supabase.js down --namespace=e2e_20260510 --confirm-production
```

## Current Environment Note

On 2026-05-10, local execution could not create deployed-backend personas because:

- `env.supabase` returned `password authentication failed for user "postgres"`.
- `.env` timed out.
- `.env.test` returned localhost access denied.

However, `SUPABASE_SERVICE_KEY` read access was valid, so the service-key fallback can seed the deployed Supabase tables when explicitly confirmed.
