# Google 소셜 로그인 운영/테스트/배포 Runbook (TEAMITAKA Backend)

백엔드: Node.js/Express + Sequelize + Cloud Run
- API Base: `https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api`
- 엔드포인트: `POST /api/auth/google/id-token`
- 기대 토큰: "Google OAuth ID 토큰" (iss ∈ {`https://accounts.google.com`, `accounts.google.com`}, aud = `GOOGLE_OAUTH_CLIENT_ID`)

중요: Firebase 사용자 ID 토큰(`result.user.getIdToken()`)을 보내지 마세요. 올바른 값은 Google OAuth 자격증명에서 추출한 "ID 토큰"입니다.
- 권장 추출: `GoogleAuthProvider.credentialFromResult(result)?.idToken`
- 또는 GIS One Tap 콜백의 `credential` (JWT)

---

## 1) 실행 체크리스트 (Do now)

1. Cloud Run 환경 변수 설정
   - `GOOGLE_OAUTH_CLIENT_ID=<구글 OAuth Web Client ID>`
   - `CORS_ORIGIN=https://teamitaka-frontend2.vercel.app`
   - (옵션) `APP_JWT_EXPIRES_IN=1d`
   - 위치: Cloud Run 서비스 → 편집 → Variables & Secrets → Variables
2. Google Console/Identity Platform 설정
   - Authorized domains에 프런트 도메인(`teamitaka-frontend2.vercel.app`) 추가
   - OAuth Web Client 생성 및 Client ID 확보
3. 프런트 코드 교체(중요)
   - Firebase Auth 로그인 후, `result.user.getIdToken()` 대신
   - `const cred = GoogleAuthProvider.credentialFromResult(result); const idToken = cred?.idToken;` 사용
   - 또는 GIS One Tap 사용 시 콜백의 `credential` 사용
4. 스모크 테스트(스테이징의 실 ID 토큰으로)
   - `POST /api/auth/google/id-token` → 200 및 `{ token }` 수신
   - 보호 API에 Authorization 헤더(`Bearer <token>`)로 접근 OK
5. 모니터링/로그 점검(배포 후 24~48h)
   - 401/5xx 비율, 응답시간, 에러 메시지 분포(aud/iss 불일치 등)

---

## 2) 환경 변수 표

| 변수명 | 설명 | 예시(스테이징) | 예시(프로덕션) | 세팅 위치 |
|---|---|---|---|---|
| GOOGLE_OAUTH_CLIENT_ID | Google OAuth Web Client ID (ID 토큰 aud 검증) | `1234-abc.apps.googleusercontent.com` | `abcd-prod.apps.googleusercontent.com` | Cloud Run → Variables |
| CORS_ORIGIN | CORS 허용 Origin(정확히 일치) | `https://teamitaka-frontend2.vercel.app` | `https://teamitaka-frontend2.vercel.app` | Cloud Run → Variables |
| APP_JWT_EXPIRES_IN | 앱 JWT 만료 기간 | `1d` | `12h` 또는 `1d` | Cloud Run → Variables |

주의
- `CORS_ORIGIN`은 스키마 포함(https://) 및 정확 일치 필요
- 값 변경 후 새 리비전 배포 필요

---

## 3) CORS · 프리플라이트 점검용 curl 예시

프리플라이트(OPTIONS)
```bash
curl -i -X OPTIONS \
  -H "Origin: https://teamitaka-frontend2.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,authorization" \
  https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/auth/google/id-token
```

예상 핵심 응답 헤더
- `Access-Control-Allow-Origin: https://teamitaka-frontend2.vercel.app`
- `Access-Control-Allow-Headers: Content-Type, Authorization`
- `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS`
- (쿠키 전략 시) `Access-Control-Allow-Credentials: true`

로그인 엔드포인트(샘플)
```bash
curl -i -X POST \
  -H "Content-Type: application/json" \
  -d '{"idToken":"<REAL_GOOGLE_OAUTH_ID_TOKEN>"}' \
  https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/auth/google/id-token
```

---

## 4) 프런트 코드 예시

중요: "Google OAuth ID 토큰"을 백엔드에 전송해야 합니다. Firebase 사용자 ID 토큰(`user.getIdToken()`)은 사용하지 않습니다.

### 4-1. 로그인(ID 토큰 추출) 및 Authorization 헤더 방식(권장)
```ts
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

const result = await signInWithPopup(auth, provider);
const credential = GoogleAuthProvider.credentialFromResult(result);
const idToken = credential?.idToken; // ✅ Google OAuth ID 토큰 (사용 권장)

// 백엔드에 전달
const loginRes = await fetch('https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/auth/google/id-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken }),
});
const { token: appToken } = await loginRes.json();

// 보호 API 호출 (헤더 방식)
const protectedRes = await fetch('https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/profile/me', {
  headers: { Authorization: `Bearer ${appToken}` },
});
```

(GIS One Tap 사용 시)
```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
<script>
  window.google.accounts.id.initialize({
    client_id: '<GOOGLE_OAUTH_CLIENT_ID>',
    callback: async ({ credential }) => {
      // ✅ credential이 Google OAuth ID 토큰
      await fetch('https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/auth/google/id-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: credential }),
      });
    },
  });
</script>
```

### 4-2. (참고) 쿠키 방식 시 조건
- 서버 Set-Cookie: `HttpOnly; Secure; SameSite=None`
- 프런트 요청: `credentials: 'include'`(fetch) 또는 `{ withCredentials: true }`(axios)
- CORS 응답: `Access-Control-Allow-Credentials: true` 필요

```ts
// 로그인 요청
await fetch('https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/auth/google/id-token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include',
  body: JSON.stringify({ idToken }),
});

// 보호 API 호출 (쿠키 전송)
await fetch('https://teamitaka-backend-zwe2nuc5ga-uc.a.run.app/api/profile/me', {
  credentials: 'include',
});
```

---

## 5) 테스트 시나리오

| 시나리오 | 조건 | 기대 상태코드 | 로그 키포인트 |
|---|---|---|---|
| 정상 | 유효한 Google OAuth ID 토큰 | 200 | `Google login success`, 토큰 발급, 사용자 생성/조회 |
| 만료 | exp 지난 토큰 | 401 | `invalid google token`, 만료 관련 메시지 |
| 서명 위조 | 페이로드 변조 | 401 | `invalid signature` 계열 메시지 |
| aud 불일치 | 다른 Client ID로 발급 | 401 | `aud mismatch` 또는 audience 검증 실패 |
| iss 불일치 | 발급자 도메인 상이 | 401 | `issuer mismatch` 또는 iss 검증 실패 |
| 토큰 누락 | idToken 없음 | 400 | `idToken is required` |

사용자 분기/상태 확인
- 신규: 자동 프로비저닝(ROLE=MEMBER), `email_verified=true`면 `email_verified_at` 세팅됨
- 기존: 로그인 성공, 필요 시 `email_verified_at` 갱신

---

## 6) 장애 시 진단 순서

1) aud 확인: 백엔드 `GOOGLE_OAUTH_CLIENT_ID`와 토큰 aud 일치 여부
2) iss 확인: `https://accounts.google.com` 또는 `accounts.google.com` 여부
3) 쿠키 속성(쿠키 전략 시): `SameSite=None; Secure`, 요청의 `credentials` 포함 여부
4) CORS 매칭: `Access-Control-Allow-Origin`이 정확한 Origin인지, Allow-Credentials/Headers 설정
5) 서버 시계: 시간 동기화 문제로 exp 검증 실패 가능성 점검

---

## 7) FAQ (Issuer mismatch 최우선)

Q. issuer mismatch(또는 aud mismatch)가 발생합니다.
- 가장 흔한 원인: Firebase 사용자 ID 토큰(`result.user.getIdToken()`)을 서버에 보내는 경우
- 해결: Google OAuth ID 토큰을 보내세요
  - Firebase Auth 팝업 결과에서 `GoogleAuthProvider.credentialFromResult(result)?.idToken` 추출
  - 또는 GIS One Tap 콜백의 `credential` 사용

Q. 쿠키가 전달되지 않습니다.
- 프런트 요청에 `credentials: 'include'` 설정 여부 확인
- 서버 Set-Cookie가 `SameSite=None; Secure`인지 확인(교차 도메인 필수)
- CORS에 `Access-Control-Allow-Credentials: true` 및 정확한 Origin 반환

Q. 기존 계정과 같은 이메일의 Google 계정을 연결하면?
- 정책 예시: 자동 병합(주의), 사용자 확인 후 병합(권장), 자동 병합 금지(보수적)
- 최소한 최초 연결 시 사용자 확인 단계를 권장

---

## 부록: README/Swagger 주의 문구 제안
- README 또는 Swagger 소개 섹션에 다음 한 줄을 추가하는 것을 권장합니다(문서만):
  - "이 엔드포인트(`/api/auth/google/id-token`)는 Google OAuth ID 토큰(iss=accounts.google.com, aud=GOOGLE_OAUTH_CLIENT_ID)을 입력으로 기대합니다. Firebase 사용자 ID 토큰은 지원하지 않습니다."

---

본 문서는 운영자가 바로 적용할 수 있는 절차/체크리스트를 제공합니다. 비밀키/개인정보는 절대 노출하지 말고, 환경 변수는 Cloud Run Variables로만 주입하세요.
