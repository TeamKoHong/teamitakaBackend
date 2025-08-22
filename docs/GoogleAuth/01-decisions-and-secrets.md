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

---

## 한국어 버전

### 1) OAuth 플로우 및 정책 결정
- 플로우 옵션 A: Authorization Code + PKCE (서버가 리디렉트/콜백 처리). HttpOnly 쿠키 활용 시 권장.
- 플로우 옵션 B: ID Token 검증(프론트가 id_token을 받아 서버로 전달, 서버는 검증 후 자체 JWT 발급). SPA/모바일에 적합.
- 동일 이메일 계정 처리(계정 링크 정책):
  - 기존 로컬 계정과 "연결"(권장) 또는 제공자 전용 새 계정 생성.
  - 충돌 시: 구글에서 이메일이 검증되었을 때 링크 우선.

### 2) 리디렉션 URI & 오리진(환경별)
- 개발(옵션 A): `http://localhost:8080/api/auth/google/callback`
- 스테이징(옵션 A): `https://<stage-host>/api/auth/google/callback`
- 프로덕션(옵션 A): `https://<prod-host>/api/auth/google/callback`
- 허용 오리진(CORS): 프런트엔드 호스트 목록과 필요 시 Swagger UI 포함.

### 3) 동의화면 & 스코프
- 앱 이름, 지원 이메일
- 스코프: `email`, `profile` (최소 권한)
- Authorized domains: 프런트/백엔드 도메인
- 공개 전 테스트 사용자 등록

### 4) 시크릿 & 환경 변수(명명과 저장 위치)
- 기능 플래그: `GOOGLE_LOGIN_ENABLED=true`
- 공통
  - `CORS_ALLOWED_ORIGINS="https://frontend.example.com,http://localhost:5173"`
  - `COOKIE_DOMAIN=example.com` (prod에서 HttpOnly 쿠키 사용 시)
- 옵션 A(리디렉트):
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI`
- 옵션 B(ID Token):
  - `GOOGLE_AUDIENCE` (클라이언트 ID와 동일)
- 저장 위치
  - 로컬 `.env.development`: 더미 값만(실제 시크릿은 금지)
  - GitHub Actions Secrets: 위 모든 항목
  - Cloud Run 환경 변수: 스테이징/프로덕션 실제 값

### 5) 승인 기준
- 플로우 선택(A/B) 확정
- 모든 환경별 리디렉트/오리진 정의 완료
- 동의화면 구성 완료(테스트 사용자 등록)
- 시크릿 키 이름 및 주입 계획 합의
