# Step 6 - CI Plan

- Add Google-related secrets to GitHub Actions (no plaintext in repo)
- Ensure tests mock Google endpoints; forbid external network
- Optional matrix: GOOGLE_LOGIN_ENABLED=true/false
- Smoke: only local flows (no Google calls)
- Require CI green for PR merge

---

## 한국어 버전

- Google 관련 시크릿을 GitHub Actions에 등록(레포 평문 금지)
- 테스트는 Google 엔드포인트 모킹 필수, 외부 네트워크 금지
- 매트릭스(선택): GOOGLE_LOGIN_ENABLED=true/false
- 스모크: 로컬 플로우만(실제 Google 호출 금지)
- PR 병합 조건: CI 그린 필수