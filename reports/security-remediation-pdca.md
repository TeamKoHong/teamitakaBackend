# Backend Security Remediation PDCA

## Objective

- Remove directly exploitable backend security issues without waiting for manual intervention.
- Keep a repeatable PDCA log so the next loops can continue from the latest accepted baseline.

## Acceptance Baseline

- `/api/dev/*` must be unreachable in production by default.
- Public account creation and user listing must not expose or store credentials unsafely.
- Registration must bind to server-side verification evidence, not client booleans.
- JWT signing must fail closed when `JWT_SECRET` is missing.
- Tracked documents must not contain live-looking secrets.

## Completed Cycles

1. Plan: prioritize exploitable runtime routes before hygiene work.
   Do: confirmed `/api/dev` was mounted in the production app path.
   Check: traced from [src/app.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/app.js) to [src/routes/devRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/devRoutes.js).
   Act: gated dev routes behind `ENABLE_DEV_ROUTES=true` and non-production.

2. Plan: remove silent JWT fallback.
   Do: removed static fallback from [src/config/authConfig.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/config/authConfig.js) and [src/config/config.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/config/config.js).
   Check: syntax verified with `node -c`.
   Act: startup now fails closed if `JWT_SECRET` is missing.

3. Plan: close public user enumeration and raw-user creation.
   Do: restricted [src/routes/userRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/userRoutes.js) to admin access for listing and direct creation.
   Check: reviewed route/controller pairing.
   Act: runtime exposure removed from the public surface.

4. Plan: stop storing plaintext password through the direct create path.
   Do: added hashing and duplicate checks in [src/controllers/userController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/userController.js).
   Check: `node -c` passed.
   Act: even admin-only direct creation no longer stores plaintext passwords.

5. Plan: stop returning sensitive fields from the admin user listing path.
   Do: reduced selected fields in [src/controllers/userController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/userController.js).
   Check: code review of returned attributes.
   Act: password hashes are no longer serialized there.

6. Plan: bind registration to server evidence, not client booleans.
   Do: changed [src/controllers/authController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/authController.js) to require recent email verification or cached server-side SMS verification.
   Check: traced SMS verify flow and registration path together.
   Act: `isSmsVerified` and `isEmailVerified` are no longer trusted as authority.

7. Plan: make SMS verification reusable by the server for a short period only.
   Do: added verified-phone cache methods in [src/services/smsService.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/services/smsService.js) and mark-on-success in [src/controllers/smsController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/smsController.js).
   Check: reviewed registration consumption path.
   Act: verified phone state is now server-owned and time-bounded.

8. Plan: fix broken SMS verify rate-limit key.
   Do: changed [src/middlewares/smsRateLimit.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/middlewares/smsRateLimit.js) to key verify attempts by `sessionId`.
   Check: matched it against [src/validations/smsValidation.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/validations/smsValidation.js).
   Act: the verify route no longer collapses into a shared `unknown` bucket.

9. Plan: reduce sensitive auth logging.
   Do: removed password/hash/token payload logs from [src/controllers/authController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/authController.js) and [src/middlewares/authMiddleware.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/middlewares/authMiddleware.js).
   Check: string search rerun.
   Act: runtime logs now leak materially less credential data.

10. Plan: harden login endpoint against stuffing and enumeration.
    Do: added [src/middlewares/authRateLimit.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/middlewares/authRateLimit.js) and applied it to [src/routes/authRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/authRoutes.js).
    Check: syntax verified with `node -c`.
    Act: login now has a bounded retry window and unified failure message.

11. Plan: ensure proxy-aware IP handling in production.
    Do: enabled `trust proxy` in [src/app.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/app.js) for production.
    Check: static review only.
    Act: IP-based limits and cookies are less likely to misbehave behind a proxy.

12. Plan: remove latent code-verification mismatch in the alternate email service.
    Do: fixed [src/services/emailVerificationService.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/services/emailVerificationService.js) to query by `code_hash`.
    Check: static review only.
    Act: that dormant path is less dangerous if reused later.

13. Plan: stop tracked docs from carrying live-looking secrets.
    Do: sanitized [ENVIRONMENT_VARIABLES_GUIDE.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/ENVIRONMENT_VARIABLES_GUIDE.md), [GITHUB_SECRETS_GUIDE.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/GITHUB_SECRETS_GUIDE.md), and [SECURITY_CHECKLIST.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/SECURITY_CHECKLIST.md).
    Check: secret-string search rerun.
    Act: tracked documentation no longer exposes the previously observed live-looking values.

14. Plan: reduce service-role edge logging.
    Do: removed full header logging and code echoing from [supabase/functions/teamitaka-api/index.ts](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/supabase/functions/teamitaka-api/index.ts), and hash stored verification codes there as well.
    Check: static review only.
    Act: edge-path credential leakage is reduced.

15. Plan: limit repeated registration abuse like login abuse.
    Do: added registration throttling in [src/middlewares/authRateLimit.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/middlewares/authRateLimit.js) and applied it in [src/routes/authRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/authRoutes.js).
    Check: syntax verified with `node -c`.
    Act: repeated register attempts from the same email/IP pair are now bounded.

16. Plan: fail closed on permissive CORS in production.
    Do: changed [src/app.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/app.js) to reject `ALLOW_ANY_ORIGIN=true` in production and require explicit configured origins.
    Check: static review only.
    Act: production no longer silently falls back to permissive `*` behavior.

17. Plan: reduce reliance on permissive public storage policies.
    Do: added [src/config/supabaseAdmin.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/config/supabaseAdmin.js) and switched [src/controllers/uploadController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/uploadController.js) to a server-side service-role client.
    Check: syntax verified with `node -c`.
    Act: upload endpoints can be backed by private bucket policies instead of anon-write assumptions.

18. Plan: fix the project-post auth mismatch before it becomes a public hole or a dead route.
    Do: changed [src/controllers/projectPostController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/projectPostController.js) to use authenticated user context, and aligned [src/routes/projectRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/projectRoutes.js) plus [src/routes/projectPostRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/projectPostRoutes.js) to require auth.
    Check: syntax verified with `node -c`.
    Act: project post creation is no longer exposed through a broken public path.

19. Plan: narrow accepted token scope.
    Do: added `jwtIssuer` in [src/config/authConfig.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/config/authConfig.js) and applied issuer claim/verification across auth issue/verify paths.
    Check: syntax verified with `node -c`.
    Act: tokens signed with the same secret but for another purpose are less likely to be accepted by API auth middleware.

20. Plan: add regression checks for the newly closed runtime holes.
    Do: added [tests/security.api.test.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/tests/security.api.test.js) to verify dev route default-off behavior, admin-guarded `/api/user`, and spoofed verification rejection.
    Check: `npm test -- --runInBand tests/security.api.test.js` passed.
    Act: the most important hardening changes now have an automated guardrail.

21. Plan: document verification caveats instead of assuming full green.
    Do: captured that Jest coverage file writing fails in this sandbox even when tests pass.
    Check: observed `EPERM` on `coverage/coverage-final.json` after a passing test run.
    Act: accepted the test pass, but did not treat coverage artifact generation as part of the baseline.

22. Plan: review public GET routes for obviously internal project surfaces before widening auth further.
    Do: traced mounted routes and confirmed project post reads were still public while the rest of the project collaboration surface was already auth-only.
    Check: reviewed [src/routes/projectPostRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/projectPostRoutes.js) together with [src/controllers/projectPostController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/projectPostController.js) and [src/services/projectPostService.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/services/projectPostService.js).
    Act: treated project post reads as internal data and moved them behind auth.

23. Plan: remove avoidable PII from review and evaluation payloads before touching broader route contracts.
    Do: removed reviewer/reviewee email selection from [src/services/reviewService.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/services/reviewService.js) and [src/controllers/evaluationController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/evaluationController.js).
    Check: added a regression test to assert those SQL statements no longer select `reviewer_email` or `reviewee_email`.
    Act: authenticated evaluation/review APIs now expose less unnecessary identity data.

24. Plan: harden admin login against brute force and role enumeration like the member login path.
    Do: applied login throttling to [src/routes/adminRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/adminRoutes.js) and unified admin login failures in [src/controllers/adminController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/adminController.js).
    Check: route stack and syntax verification rerun.
    Act: admin auth is less enumerable and less exposed to repeated guessing.

25. Plan: reduce sensitive runtime logging in recovery and collaboration paths.
    Do: removed verbose request/identifier logging from [src/controllers/findIdController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/findIdController.js), [src/controllers/authController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/authController.js), and [src/routes/projectPostRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/projectPostRoutes.js).
    Check: log-string grep rerun on the touched files.
    Act: recovery and collaboration flows now leak materially less PII into server logs.

26. Plan: narrow admin token acceptance beyond a bare `role=ADMIN` claim.
    Do: changed [src/controllers/adminController.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/controllers/adminController.js) to sign `adminId`, and [src/middlewares/adminMiddleware.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/middlewares/adminMiddleware.js) to require it.
    Check: added a regression test to reject admin-role tokens without `adminId`.
    Act: admin routes now accept a smaller token shape than the general user auth path.

27. Plan: verify whether deployment config could still surface `/api/dev/*`, then reduce the blast radius even in non-production.
    Do: reviewed [vercel.json](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/vercel.json) and [scripts/deploy-to-vercel.sh](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/scripts/deploy-to-vercel.sh), confirmed production sets `NODE_ENV=production`, and added a second gate in [src/routes/devRoutes.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/src/routes/devRoutes.js) that requires `DEV_ROUTE_TOKEN` in addition to `ENABLE_DEV_ROUTES=true`.
    Check: added a regression test proving dev routes stay closed without the secondary token even when `ENABLE_DEV_ROUTES=true`.
    Act: accidental staging or preview exposure now requires two explicit misconfigurations instead of one.

28. Plan: assess whether JSON body tokens can be removed now that HttpOnly cookies are issued.
    Do: traced the current frontend contract and confirmed [src/services/auth.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitakaFrontend3/src/services/auth.js), [src/pages/LoginPage/LoginPage.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitakaFrontend3/src/pages/LoginPage/LoginPage.js), and [src/contexts/AuthContext.js](/Users/_woo_s.j/Desktop/woo/workspace/teamitakaFrontend3/src/contexts/AuthContext.js) still persist `result.token`.
    Check: repo-wide search rerun from the frontend workspace.
    Act: left this as a coordinated migration item instead of breaking auth by flipping the backend alone.

29. Plan: turn the RLS uncertainty into an explicit audit artifact instead of an implicit warning.
    Do: added [supabase-rls-drift-audit.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/supabase-rls-drift-audit.md) to capture the permissive tracked SQL files and the exact live export check that still needs to happen.
    Check: cross-referenced the tracked SQL files containing `USING (true)` and `Enable all access` policies.
    Act: the remaining Supabase policy risk is now documented as a concrete operational verification task.

30. Plan: close the current PDCA run with an explicit rotation and rerun handoff instead of leaving it as tribal knowledge.
    Do: added [credential-rotation-checklist.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/credential-rotation-checklist.md) and reran targeted security validation.
    Check: `git diff --check`, `node -c`, and `npm test -- --runInBand tests/security.api.test.js` all passed again, with the same coverage-file `EPERM` caveat.
    Act: the code-side hardening baseline is complete, and the remaining work is now clearly limited to coordinated frontend migration and operator-only runtime tasks.

## Remaining Operator Tasks

1. Remove token duplication between JSON body and HttpOnly cookie after the frontend auth flow stops depending on `result.token`.
2. Export the real Supabase RLS policies from the dashboard and compare them with [supabase-rls-drift-audit.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/supabase-rls-drift-audit.md).
3. Rotate any DB/JWT/Supabase service credentials that were ever committed to tracked docs, following [credential-rotation-checklist.md](/Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend/reports/credential-rotation-checklist.md).

## Current Verification

- `git diff --check` passed after the current patch set.
- `node -c` passed for all changed backend JavaScript files.
- `npm test -- --runInBand tests/security.api.test.js` passed, but coverage file emission failed in this sandbox with `EPERM`.

## Next Start Point

- Start with the frontend cookie-only auth migration if cross-repo changes are allowed.
- Otherwise start with the live Supabase policy export and credential rotation checklist in the operator environment.
