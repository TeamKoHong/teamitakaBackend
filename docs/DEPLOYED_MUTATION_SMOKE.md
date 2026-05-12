# Deployed Mutation Smoke

배포된 백엔드에서 실제 사용자 변경 플로우가 끝까지 동작하는지 확인하는 QA 하네스입니다. 테스트 전후로 Supabase E2E namespace를 초기화할 수 있어 반복 실행해도 같은 기준선에서 검증합니다.

## 실행

```bash
NODE_ENV=production \
TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
npx dotenv -e env.supabase -- \
npm run qa:deployed-mutation-smoke -- \
  --reset-before \
  --reset-after \
  --confirm-production
```

기본 대상은 `https://teamitakabackend.onrender.com` 입니다. 다른 배포 URL은 다음처럼 지정합니다.

```bash
API_BASE_URL='https://example.com' \
NODE_ENV=production \
TEAMITAKA_E2E_ALLOW_PRODUCTION=1 \
npx dotenv -e env.supabase -- \
npm run qa:deployed-mutation-smoke -- \
  --reset-before \
  --reset-after \
  --confirm-production
```

## 검증 플로우

- 테스트 페르소나 로그인
- 모집글 지원
- 지원 취소
- 지원자 목록 조회
- 지원 승인
- 지원 거절
- 승인된 지원자로 프로젝트 전환
- 일정 생성/수정
- 회의록 생성/수정
- 평가 생성
- 평가 요약 조회

## 주요 옵션

- `--namespace`: E2E 테스트 데이터 namespace. 기본값은 `e2e_20260510`.
- `--reset-before`: 실행 전 해당 namespace 데이터를 재생성한다.
- `--reset-after`: 실행 후 해당 namespace 데이터를 재생성해 mutation 흔적을 제거한다.
- `--confirm-production`: production 환경에서 seed mutation을 허용하기 위한 명시 플래그.
- `--manifest`: 이미 생성된 `reports/e2e-personas/*.supabase.json` manifest를 직접 지정한다.
- `--output`: JSON 리포트 경로. 기본값은 `reports/qa/deployed-mutation-smoke/latest.json`.
- `--timeout-ms`: 요청별 타임아웃. 기본값은 30000ms.

## 안전 기준

이 하네스는 `scripts/e2e/seed-test-personas-supabase.js`와 같은 namespace 안전장치를 사용합니다. `NODE_ENV=production`에서 데이터를 바꾸려면 `TEAMITAKA_E2E_ALLOW_PRODUCTION=1`과 `--confirm-production`이 모두 필요합니다.

리포트에는 토큰과 비밀번호를 저장하지 않습니다. 단, seed manifest에는 테스트 계정 비밀번호가 포함되므로 `reports/e2e-personas`는 커밋 대상이 아닙니다.

실패 리포트는 다음 파일에 남습니다.

```text
reports/qa/deployed-mutation-smoke/latest.json
```
