## Google Social Login Implementation Guide (Identity Platform First)

목표: Google 계정으로 간편 로그인/회원가입을 제공한다. 클라이언트(Firebase Auth)에서 발급된 ID 토큰을 백엔드에서 검증하고, 애플리케이션 자체 JWT 세션을 발급한다.

### 1) 구성 개요
- 권장 아키텍처: Identity Platform(Firebase Auth Web SDK) + 백엔드 ID 토큰 검증 + 앱 JWT 발급
- 대안: 직접 OAuth 2.0(예: passport-google-oauth20) – 운영 자가관리 필요

### 2) Google Console/Identity Platform 설정
1. Google Cloud Console → Identity Platform → ID 공급업체 → 공급업체 추가 → "Google"
2. Google OAuth Web Client 생성 → Client ID/Secret 확보
3. Redirect URI 등록: 커스텀 도메인 사용 시 `https://auth.example.com/__/auth/handler`
4. 승인된 도메인에 프론트 도메인/localhost 등록
5. SDK 초기화 스니펫 확보 및 프론트에 적용

필요 환경 변수(백엔드)
```
GOOGLE_OAUTH_CLIENT_ID=...
JWT_SECRET=...
APP_JWT_EXPIRES_IN=1d
```

### 3) 프론트엔드(요약)
```ts
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

await fetch('/api/auth/google/id-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});
```

### 4) 백엔드 엔드포인트 설계
- POST `/api/auth/google/id-token`
  - body: `{ idToken }`
  - 동작: ID 토큰 검증 → 사용자 조회/생성 → `email_verified_at` 세팅(when email_verified=true) → 앱 JWT 발급

검증 요건
- JWKs 서명 검증, `aud` == `GOOGLE_OAUTH_CLIENT_ID`, `iss` in `https://accounts.google.com`, 만료 확인

### 5) 데이터 모델 영향
- `Users.email_verified_at` 사용 권장
- 선택: `google_sub` 컬럼으로 Google subject를 보관(계정 연결 안정화)

### 6) 보안/운영
- HttpOnly Secure 쿠키 사용 권장, 토큰 만료 짧게(예: 1일)
- 승인된 도메인/리디렉트 URI 관리
- 로깅은 PII 마스킹

### 7) 테스트 체크리스트
- 유효/만료/오디언스 불일치/서명 실패
- 신규/기존 유저 분기
- email_verified true/false 분기

### 8) 구현 순서
1. 백엔드: `/api/auth/google/id-token` 라우트/컨트롤러 추가, JWKs 검증 유틸(`jose`/`google-auth-library`)
2. 모델 확장 필요 시 `google_sub` 마이그레이션
3. 프론트: Firebase Auth Google 로그인 붙이고 idToken 전달
4. 테스트/문서/환경 변수 반영

### 9) 직접 OAuth(대안) 시
- env: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REDIRECT_URI`
- 플로우: `/auth/google` → 구글 동의 → `/auth/google/callback` → 프로필 취득 → JWT 발급
- 보안: state/nonce, HTTPS, 스코프 최소, 에러 처리

---

## 10) 환경 변수 템플릿(.env 예시)
```
NODE_ENV=development

# Google Social Login
GOOGLE_OAUTH_CLIENT_ID=your-google-web-client-id

# App JWT
JWT_SECRET=replace-with-strong-secret
APP_JWT_EXPIRES_IN=1d

# CORS/Redirect (선택)
CORS_ORIGIN=https://app.example.com
ALLOWED_REDIRECTS=https://app.example.com,https://app.example.com/verify
```

## 11) Swagger 추가 가이드(요약)
paths 섹션에 다음을 추가:
```yaml
/auth/google/id-token:
  post:
    tags: [인증]
    summary: Google ID 토큰 기반 로그인
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              idToken:
                type: string
            required: [idToken]
    responses:
      '200':
        description: 로그인 성공
        content:
          application/json:
            schema:
              type: object
              properties:
                message:
                  type: string
                  example: Google login success
                token:
                  type: string
      '400':
        description: 잘못된 요청(idToken 누락 등)
      '401':
        description: 유효하지 않은 구글 토큰
      '500':
        description: 서버 설정 누락(GOOGLE_OAUTH_CLIENT_ID 등)
```

## 12) 에러 매핑(백엔드 → 프론트 UX)
- 400: idToken 누락/파싱 오류 → "로그인 정보가 올바르지 않습니다. 다시 시도해 주세요."
- 401: aud/iss/exp/서명 검증 실패 → "Google 인증에 실패했습니다. 다시 시도해 주세요."
- 500: 서버 설정 누락 → "서비스 설정 오류입니다. 잠시 후 다시 시도해 주세요."

## 13) QA 체크리스트
- 유효 idToken → 200, JWT 수신, 쿠키 저장
- 만료 idToken → 401
- aud 불일치 → 401
- 이메일 없는 토큰 → 400
- 기존 사용자/신규 사용자 분기 정상 동작
- `email_verified=true` → `email_verified_at` 세팅 확인
- HttpOnly+Secure 쿠키(프로덕션) 속성 확인

## 14) 배포/운영 체크리스트
- [ ] 구글 콘솔: 승인 도메인/리디렉트 설정, Web Client 생성
- [ ] 서버: `GOOGLE_OAUTH_CLIENT_ID`, `JWT_SECRET`, `APP_JWT_EXPIRES_IN` 주입
- [ ] CORS/쿠키 설정 점검(프로덕션 secure/samesite)
- [ ] Swagger 문서 반영
- [ ] 모니터링: 401/5xx 비율, 응답시간

## 15) 작업 순서(권장)
1. 구글 콘솔 설정 완료 → `GOOGLE_OAUTH_CLIENT_ID` 발급/주입
2. 프론트: Firebase Auth 붙이고 `idToken` 백엔드 전달
3. 백엔드: 스테이징에서 통합 테스트(실제 idToken)
4. Swagger/문서 업데이트, QA 체크리스트 수행
5. PR 생성 → 코드 리뷰 → dev 병합/배포

