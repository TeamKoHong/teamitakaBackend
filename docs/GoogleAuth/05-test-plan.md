# Step 5 - Test Plan

## Unit
- Token verifier (mocked): valid/invalid/expired/wrong aud
- User upsert/link logic

## Integration
- A: `/api/auth/google` redirect → callback (mock Google exchange)
- B: `/api/auth/google/token` with mocked valid/invalid id_token

## Edge/Negative
- Missing token, rate limit hit, provider 5xx → 503
- Email collision: link vs new account paths

## Coverage
- Target ≥ 80%

## CI
- No outbound calls (nock/fixtures). Secrets loaded from CI env but not used for real calls