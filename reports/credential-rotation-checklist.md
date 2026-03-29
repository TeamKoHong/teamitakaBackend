# Credential Rotation Checklist

## Why Rotation Is Still Required

- This repository previously contained live-looking DB and JWT values in tracked documentation.
- The documents were sanitized, but sanitizing history is not the same as rotating credentials.
- The safe assumption is that any value ever committed should be treated as compromised until rotated.

## Rotate Immediately

- `JWT_SECRET`
- Primary database password used by the backend runtime
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SERVICE_KEY`
- Any SMTP or SendGrid credential that was ever stored in tracked docs or helper files

## After Rotation

1. Update deployment secrets in the active backend deployment target.
2. Update local secret stores used by maintainers.
3. Invalidate old long-lived tokens where possible.
4. Verify startup still fails closed when `JWT_SECRET` is missing.
5. Re-run login, register, upload, and admin auth smoke tests.

## Do Not Count As Rotation

- Rewriting example files
- Editing markdown only
- Replacing values with placeholders in git history going forward

## Acceptance

- All previously documented live-looking credentials have been replaced in the runtime environment.
- Old values no longer authenticate or connect.
