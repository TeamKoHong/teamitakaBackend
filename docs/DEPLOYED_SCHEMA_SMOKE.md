# Deployed Schema Smoke

배포된 백엔드가 프론트엔드 계약과 같은 응답 구조를 유지하는지 확인하는 QA 하네스입니다. 로컬 Jest 계약 테스트는 코드 변경을 막고, 이 smoke는 Render 같은 실제 배포본이 최신 계약과 어긋났는지 잡습니다.

## 실행

```bash
TEAMITAKA_E2E_PASSWORD='...' npm run qa:render-schema-smoke
```

기본 대상은 `https://teamitakabackend.onrender.com` 입니다. 다른 배포 URL은 다음처럼 지정합니다.

```bash
API_BASE_URL='https://example.com' \
TEAMITAKA_E2E_PASSWORD='...' \
npm run qa:deployed-schema-smoke
```

주요 옵션:

- `--email`: seeded E2E 계정 이메일. 기본값은 `e2e_20260510_owner@test.teamitaka.local`.
- `--recruitment-id`: 모집글 상세 계약 확인에 사용할 기존 모집글 ID.
- `--project-id`: 리뷰 요약 계약 확인에 사용할 기존 프로젝트 ID.
- `--output`: JSON 리포트 경로. 기본값은 `reports/qa/deployed-schema-smoke/latest.json`.

## 실패 기준

이 하네스는 “현재 구현이 통과하도록 맞춘 테스트”가 아니라 “프론트가 의존하는 배포 계약”을 검사합니다. 따라서 배포본이 오래되어 있거나 라우트/응답 봉투가 다르면 실패하는 것이 정상입니다.

P0로 보는 대표 실패:

- `GET /api/recruitments?page=1&pageSize=1` 이 배열을 직접 반환하고 `data.items`, `data.pagination` 봉투를 반환하지 않음.
- `GET /api/recruitments/:id` 공개 상세 조회가 401을 반환함.
- `GET /api/todos`, `GET /api/schedules/upcoming` 이 배포본에서 404를 반환함.
- 로그인은 되지만 `/api/auth/me` 등 인증 라우트가 동일 토큰으로 동작하지 않음.

실패 리포트는 다음 파일에 남습니다.

```text
reports/qa/deployed-schema-smoke/latest.json
```
