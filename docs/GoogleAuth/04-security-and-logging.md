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

---

## 한국어 버전

### 옵션 A(리디렉트)
- state + PKCE 사용
- 세션/쿠키 흐름이면 콜백에 CSRF 보호 적용
- 쿠키: HttpOnly, Secure(prod), SameSite=Lax/Strict

### 옵션 B(ID Token)
- google-auth-library로 `aud`, `iss`, `exp`, `sub` 검증
- `iss`는 ["accounts.google.com", "https://accounts.google.com"]만 허용

### 공통
- CORS: 신뢰 오리진만 허용, `*` 금지
- 레이트리밋: 로그인 엔드포인트 IP/이메일 기준 제한
- 로그 마스킹: 이메일 `abc***@***`, 토큰 접두부만 출력
- 에러 매핑: 400/401/429/503 일관된 메시지

### 승인 기준
- 보안 체크리스트 승인
- 마스킹 규칙 구현 반영