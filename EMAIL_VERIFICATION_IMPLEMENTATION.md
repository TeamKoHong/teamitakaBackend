## Google Social Login – Implementation Guide (Identity Platform 우선)

목표: Google 계정으로 간편 로그인/회원가입을 제공한다. ID 토큰을 백엔드에서 검증하고, 애플리케이션 자체 JWT 세션을 발급한다. 이메일 인증 전략과 일관되게 동작하도록 연계한다.

### 1) 접근 방식 비교
- 권장안(Identity Platform 기반)
  - 프론트: Identity Platform(Firebase Auth Web SDK)로 Google 로그인 진행(팝업/리디렉션)
  - 백엔드: 클라이언트가 전달한 Google ID 토큰을 검증 → 내부 사용자 조회/생성 → 자체 JWT 발급
  - 장점: 검증/보안/UX 표준화, 유지보수 용이
  - 단점: GCP 의존, 초기 구성 필요

- 대안(직접 OAuth 2.0, 예: Passport)
  - 프론트/백엔드: Google OAuth 승인을 백엔드에서 처리(콜백 URI)
  - 장점: 클라우드 의존 완화, 커스텀 플로우 자유도
  - 단점: 토큰 검증/보안/에지케이스 직접 관리 필요

본 문서는 권장안(Identity Platform) 중심으로 정리하고, 말미에 직접 OAuth 대안을 요약한다.

### 2) 콘솔 설정(Identity Platform)
1. Google Cloud Console → Identity Platform → ID 공급업체 → 공급업체 추가 → "Google" 선택
2. Google OAuth 클라이언트 생성(웹): Client ID, Client Secret 확보
3. Redirect URI 등록: 커스텀 도메인을 사용 중이면 해당 도메인의 `__/auth/handler` 경로 반영
4. 승인된 도메인에 앱 도메인 추가(개발 시 `localhost` 추가 필요할 수 있음)
5. 앱 설정 스니펫으로 클라이언트 SDK 초기화 값 확보

필요 환경 변수(예):
```
GCP_PROJECT_ID=...
GCP_IDP_GOOGLE_CLIENT_ID=...
GCP_IDP_GOOGLE_CLIENT_SECRET=...

// 백엔드에서 구글 ID 토큰 검증 시 사용(클라이언트 ID 체크)
GOOGLE_OAUTH_CLIENT_ID=...
```

### 3) 프론트엔드 플로우(요약)
- SDK 초기화 후 `GoogleAuthProvider`로 로그인 → `signInWithPopup` 또는 `signInWithRedirect`
- 로그인 성공 시 ID 토큰(ID token)을 획득 → 백엔드로 전송

예시(웹 v9, 요약):
```ts
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

// 백엔드로 ID 토큰 전송
await fetch('/api/auth/google/id-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});
```

### 4) 백엔드 설계(Express)
엔드포인트(권장):
- POST `/api/auth/google/id-token`
  - body: `{ idToken }`
  - 동작: 구글 ID 토큰 검증 → 사용자 조회/생성 → 애플리케이션 JWT 발급 → 쿠키/바디 반환

검증 로직 개요:
1) ID 토큰 구조/서명/만료 검증(JWKs; Audience=`GOOGLE_OAUTH_CLIENT_ID` 매칭)
2) 이메일/서브(sub) 추출, 이메일 검증 플래그(`email_verified`) 확인
3) 내부 사용자 매핑 키 전략
   - 기본: `email` 고유 매핑
   - 보완: Google `sub`(고유 subject) 별도 보관으로 계정 연결 안정화
4) 신규 유저일 경우 프로비저닝(기본 Role=MEMBER), `email_verified_at` 즉시 세팅 가능(구글이 검증한 이메일인 경우)
5) JWT 발급 및 HttpOnly 쿠키 설정(옵션)

예시 반환:
```json
{ "message": "Google login success", "token": "<app_jwt>", "user": { "email": "..." } }
```

### 5) 데이터 모델 영향
- `Users.email_verified_at` 를 사용하는 경우
  - Google `email_verified` 가 true면 가입 시 `email_verified_at = now()` 설정
  - false인 경우(드물지만 가능): 이메일 인증 플로우 안내 또는 제한 정책 적용
- 사용자 식별: 이메일+Google `sub` 보관(추가 컬럼 예: `google_sub`)

### 6) 보안/정책
- 토큰 검증
  - Audience(`aud`)가 우리 `GOOGLE_OAUTH_CLIENT_ID` 와 일치하는지 확인
  - Issuer(`iss`)가 Google 발급자 도메인인지(`https://accounts.google.com` 등)
  - 서명 키(JWKs) 캐싱 및 키 롤오버 대응
- 세션 관리
  - 애플리케이션 JWT는 HttpOnly, Secure 쿠키 사용 권장
  - 토큰 수명 단축(예: 1일), 리프레시 전략은 필요 시 별도 설계
- 계정 정책
  - 이메일 도메인 제한(옵션), 사용자 타입/권한 매핑
  - 탈퇴/연동 해제 시 구글 계정 연결 해제 UX 제공(옵션)
- 로깅/프라이버시
  - PII 마스킹, 민감 정보 로그 금지
  - 실패 사유/지연 로깅으로 장애 관측성 확보

### 7) 환경 변수/설정 예시
```
GOOGLE_OAUTH_CLIENT_ID=...
APP_JWT_SECRET=...
APP_JWT_EXPIRES_IN=1d
COOKIE_SECURE=true
```

### 8) 라우팅/컨트롤러 통합 체크리스트
1. `authRoutes.js` 에 `/api/auth/google/id-token` POST 추가
2. `authController.js` 에 `googleSignInByIdToken`(가칭) 추가
   - 입력 검증(idToken 존재 여부)
   - Google ID 토큰 검증 → 사용자 조회/생성 → JWT 발급 → 응답
3. Swagger 문서 업데이트: 요청/응답/오류 케이스 명시

### 9) 테스트 전략(TDD)
- 단위
  - ID 토큰 검증 유효/만료/서명 불일치/오디언스 미스매치
  - 신규 유저 프로비저닝/기존 유저 로그인 분기
  - `email_verified` true/false 분기, `email_verified_at` 처리
- 통합
  - `/api/auth/google/id-token` 성공/400/401/500 케이스
  - JWT 쿠키 설정/보안 속성 확인

### 10) 프론트 UX 고려 사항
- 팝업 차단 시 리디렉션 플로우로 대체
- 최초 가입 시 프로필 세팅 온보딩(optional)
- 로딩/에러 핸들링(네트워크/권한/취소)

### 11) 운영/릴리즈 체크리스트
- 승인된 도메인/리다이렉트 URI 재검증(스테이징/프로덕션 분리)
- 비밀키/클라이언트 ID 환경 구성 및 회전 정책
- 장애 대응: 토큰 검증 실패 로그 대시보드/알림

### 12) 직접 OAuth 2.0(대안) 요약
- 패키지 예: `passport-google-oauth20`
- 플로우: `/auth/google` → 구글 동의 → `/auth/google/callback`
- 콜백에서 프로필/이메일 확보 → 내부 사용자 매핑 → JWT 발급
- 보안: state/nonce, HTTPS, 스코프 최소화, 에러 처리 철저

### 13) 이메일 인증과의 연계
- Google 로그인에서는 대개 `email_verified=true` → `Users.email_verified_at` 즉시 세팅 가능
- 필요 정책: 조직 도메인 강제 등 특수 규칙 시 추가 검증 수행

### 작업 분담

#### Assistant(내가 수행)
- 백엔드 코드 변경
  - `src/routes/authRoutes.js`: `POST /api/auth/google/id-token` 라우트 추가
  - `src/controllers/authController.js`: `googleSignInByIdToken` 구현(입력 검증 → Google ID 토큰 검증 → 사용자 조회/생성 → 앱 JWT 발급/쿠키 설정)
  - `src/utils/googleTokenVerifier.js`(신규): Google ID 토큰 검증 유틸(`google-auth-library` 또는 `jose` 기반)
  - `src/config/authConfig.js`: `GOOGLE_OAUTH_CLIENT_ID` 등 환경 변수 매핑 추가
  - `swagger.yaml`: 엔드포인트/요청/응답/오류 케이스 문서화 업데이트
  - 선택: `src/models/User.js` 및 마이그레이션(신규)로 `google_sub` 컬럼 추가 및 매핑
- 테스트 추가
  - `tests/auth.google.test.js`(신규): 유효/만료/오디언스 불일치/신규·기존 유저 분기/JWT 쿠키 속성 검증
- 보안/품질 보강
  - Audience/Issuer 검증, JWKs 키 캐싱, 에러 로깅/마스킹 적용
  - 린트/타입/테스트 그린 상태 유지 및 Swagger 일치 검증

#### User(당신이 수행)
- Google Cloud/Identity Platform 구성
  - Identity Platform 사용 설정 후 공급업체에 Google 추가
  - Google OAuth 클라이언트(Web) 생성: Client ID/Secret 확보
  - Redirect URI 및 승인된 도메인 등록(스테이징/프로덕션 분리)
- 환경 변수/시크릿 주입(실/스테이징 모두)
  - `GOOGLE_OAUTH_CLIENT_ID`, `APP_JWT_SECRET`, `APP_JWT_EXPIRES_IN`, `COOKIE_SECURE`
  - 배포 환경의 시크릿 매니저 또는 CI/CD 변수에 안전하게 저장
- 프론트엔드 연결
  - Firebase Auth(Web SDK) 초기화 및 `GoogleAuthProvider` 로그인 구현
  - 로그인 성공 시 `idToken`을 백엔드 `/api/auth/google/id-token`으로 전달
- 정책/문서
  - 조직 도메인 제한/권한 매핑 여부 결정
  - 개인정보처리방침/서비스 약관 업데이트(소셜 로그인 추가 표기)

#### 결정 필요 사항(합의 후 진행)
- Identity Platform 방식(권장) vs 직접 OAuth 방식 채택
- `google_sub` 컬럼 도입 여부 및 기존 사용자 계정 연결 정책
- `email_verified_at` 자동 세팅 허용 범위(구글 `email_verified` 기준)
- 세션 보관 전략: 쿠키 옵션, 만료, 리프레시 정책
