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

---

## 한국어 버전

### 단위 테스트
- 토큰 검증기(모킹): 유효/무효/만료/aud 불일치
- 사용자 upsert/링크 로직

### 통합 테스트
- A: `/api/auth/google` 리디렉트 → 콜백(구글 교환 모킹)
- B: `/api/auth/google/token` 유효/무효 id_token 모킹

### 엣지/부정 케이스
- 토큰 누락, 레이트리밋 초과, 프로바이더 5xx → 503
- 이메일 충돌: 링크 vs 신규 계정 경로

### 커버리지
- 목표 ≥ 80%

### CI
- 외부 네트워크 호출 금지(nock/fixtures 사용). 시크릿은 로드하되 실제 호출 없음