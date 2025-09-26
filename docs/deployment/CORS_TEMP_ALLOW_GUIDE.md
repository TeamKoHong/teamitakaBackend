## CORS 임시 완전 허용 가이드 (Frontend용)

> 목적: 로컬/스테이징 개발 중 CORS 에러로 개발이 막힐 때, 백엔드에서 임시로 "모든 Origin 허용" 상태를 열어 빠르게 개발/디버깅을 가능하게 합니다. 운영 배포 전에는 반드시 원복하세요.

### 적용 범위
- 로컬/스테이징 환경에서만 사용하세요. 프로덕션 금지.
- 자격증명(쿠키/Authorization) 요청도 허용됩니다. 단, 민감 API 호출은 지양하세요.

### 백엔드 스위치
- 환경변수: `ALLOW_ANY_ORIGIN=true`
- 코드 위치: `src/app.js`
  - `ALLOW_ANY_ORIGIN`가 `true`이면 모든 Origin을 허용하도록 CORS가 동작합니다.
  - `credentials: true` 환경에서도 안전하게 동작하도록 요청 Origin을 그대로 허용합니다.

### 사용 방법
1) 백엔드 실행 전 환경변수 설정
```bash
# development 예시
ALLOW_ANY_ORIGIN=true npm run dev

# 또는 dotenv를 사용하는 경우
ALLOW_ANY_ORIGIN=true npx dotenv -e .env.development -- nodemon index.js
```

2) 프론트엔드에서 요청 테스트
- 예: 로컬 프론트(`http://localhost:3000`) → 로컬 백엔드(`http://localhost:3001`)
- 쿠키를 사용하는 요청이라면 `fetch`/`axios`에서 `credentials: 'include'` 또는 `withCredentials: true`를 설정하세요.

3) 동작 확인(프리플라이트/본요청)
```bash
# 프리플라이트 확인
curl -i -X OPTIONS http://localhost:3001/api/health \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"

# 본요청 확인
curl -i http://localhost:3001/api/health -H "Origin: http://localhost:3000"
```
- 기대 헤더: `Access-Control-Allow-Origin`에 요청 Origin 그대로 반환, `Access-Control-Allow-Credentials: true`

### 원복(중요)
- 개발 완료 또는 배포 전에는 반드시 임시 허용을 해제하세요.
- 해제 방법: 환경변수 미설정(기본 동작으로 복귀) 또는 `ALLOW_ANY_ORIGIN=false`
- 원래 방식: `CORS_ORIGIN`에 정확한 도메인(예: `https://www.teamitaka.com`)만 허용

### 대안(백엔드 무변경)
- 프론트 개발 서버의 프록시 설정 사용(Next/Vite devServer proxy)
- 요청을 같은 오리진으로 프록시함으로써 브라우저 CORS를 우회합니다.

### 주의사항
- 이 설정은 모든 Origin을 허용합니다. 민감한 API(계정/결제/이메일 발송)는 테스트하지 마세요.
- 프로덕션 환경에서는 절대 사용하지 마세요.

---

## Local Development Guide (teamitakaFrontend2 ↔ backend)

### 1) Backend (CORS 임시 전체 허용으로 실행)
```bash
cd /Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend
ALLOW_ANY_ORIGIN=true npm run dev
# 기본 포트: 8080
```

정상 동작 확인:
```bash
curl -i -X OPTIONS http://localhost:8080/api/health \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET"

curl -i http://localhost:8080/api/health \
  -H "Origin: http://localhost:3000"
```

### 2) Frontend (Create React App: teamitakaFrontend2)
```bash
cd /Users/_woo_s.j/Desktop/woo/workspace/teamitakaFrontend2
echo "REACT_APP_API_BASE_URL=http://localhost:8080" >> .env.development
npm start
# 기본 포트: 3000
```

fetch/axios 예시(자격증명 필요 시):
```js
// fetch
fetch('http://localhost:8080/api/health', { credentials: 'include' })
  .then(r => r.json()).then(console.log).catch(console.error);

// axios
import axios from 'axios';
axios.get('http://localhost:8080/api/health', { withCredentials: true })
  .then(r => console.log(r.data)).catch(console.error);
```

### 3) 브라우저에서 확인할 것
- Network 탭의 응답 헤더:
  - `Access-Control-Allow-Origin: http://localhost:3000`
  - `Access-Control-Allow-Credentials: true`

### 4) Troubleshooting
- 백엔드가 `ALLOW_ANY_ORIGIN=true`로 실행됐는지 확인
- 프론트 `.env.development`의 `REACT_APP_API_BASE_URL`이 정확한지(프로토콜/포트 포함)
- 인증 필요한 요청인지 확인하고, 필요한 경우 `credentials/include` 설정
- 여전히 이슈면 프리플라이트 명령으로 Allow-* 헤더 누락 여부 확인

### 5) 종료/원복
- 개발 세션 종료 후 `ALLOW_ANY_ORIGIN` 미설정으로 원복
- 배포 환경에서는 반드시 도메인 화이트리스트(`CORS_ORIGIN`) 방식 사용
