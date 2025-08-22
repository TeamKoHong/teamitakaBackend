# Step 6 - CI Plan

- Add Google-related secrets to GitHub Actions (no plaintext in repo)
- Ensure tests mock Google endpoints; forbid external network
- Optional matrix: GOOGLE_LOGIN_ENABLED=true/false
- Smoke: only local flows (no Google calls)
- Require CI green for PR merge