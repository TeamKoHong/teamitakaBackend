# Step 2 - API Contracts & Swagger Plan

## A) Authorization Code + PKCE (Redirect)
- GET `/api/auth/google` → 302 to Google with state & PKCE (no body)
- GET `/api/auth/google/callback?code&state` → server exchanges code, validates state/PKCE
  - 200 (JSON) `{ message: "login success", token?: string }` OR sets HttpOnly cookie
  - 401 invalid state/code; 503 provider unavailable

## B) ID Token Verification (Backend Only)
- POST `/api/auth/google/token`
  - body: `{ id_token: string }`
  - 200: `{ message: "login success", token: string }`
  - 400: missing token; 401: invalid token/aud/iss/exp; 503 provider unavailable

## Shared Output
- JWT claims: `{ userId, email, provider: 'GOOGLE'|'LOCAL', username?, avatar? }`
- On first login: upsert user, set `provider=GOOGLE`, store `google_id`, `profileImageUrl` if provided

## Error Model (standardized)
```json
{ "code": "Unauthorized", "message": "invalid google token", "details": {} }
```

## Swagger Updates (no code changes yet)
- Paths: add the endpoint(s) above under `tags: [Auth]`
- Schemas: `GoogleIdTokenRequest`, `AuthSuccessResponse`, `AuthError`
- Examples for dev/stage URLs
- Security note: cookie vs bearer token documented

## Acceptance Criteria
- Endpoint shapes frozen
- Error codes & payloads defined
- Swagger change list approved

---

## 한국어 버전

### A) Authorization Code + PKCE (리디렉트)
- GET `/api/auth/google` → Google로 302 리디렉트(state/PKCE 포함)
- GET `/api/auth/google/callback?code&state` → 서버가 code 교환 및 state/PKCE 검증
  - 200 (JSON) `{ message: "login success", token?: string }` 또는 HttpOnly 쿠키 설정
  - 401(state/code 오류), 503(프로바이더 장애)

### B) ID Token 검증(백엔드 단독)
- POST `/api/auth/google/token`
  - Body: `{ id_token: string }`
  - 200: `{ message: "login success", token: string }`
  - 400: 토큰 누락, 401: aud/iss/exp 등 검증 실패, 503: 프로바이더 장애

### 공통 응답
- JWT 클레임 예: `{ userId, email, provider: 'GOOGLE'|'LOCAL', username?, avatar? }`
- 최초 로그인 시: 사용자 upsert, `provider=GOOGLE`, `google_id`, `profileImageUrl` 저장 가능

### 에러 모델(표준)
```json
{ "code": "Unauthorized", "message": "invalid google token", "details": {} }
```

### Swagger 변경(코드 수정 전 문서화)
- Paths 추가(위 엔드포인트들, `tags: [Auth]`)
- Schemas: `GoogleIdTokenRequest`, `AuthSuccessResponse`, `AuthError`
- 예시: dev/stage URL 포함
- 보안: 쿠키 vs 베어러 토큰 방식 주석

### 승인 기준
- 엔드포인트 계약 동결
- 에러 코드/페이로드 정의 완료
- Swagger 변경 목록 승인