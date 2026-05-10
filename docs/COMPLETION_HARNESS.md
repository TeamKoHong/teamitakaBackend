# Teamitaka Backend Completion Harness

이 문서는 백엔드가 프론트/Figma/Notion 기준선과 맞는지 판단하기 위한 최소 하네스다. 목표는 API가 “구현되어 보임”이 아니라 실제 앱의 P0 플로우를 재현 가능한 데이터와 계약으로 통과시키는 것이다.

## Backend 완료 기준

하나의 API는 아래 조건을 모두 만족해야 완료다.

| 영역 | 완료 조건 |
| --- | --- |
| Contract | Swagger/OpenAPI path, method, auth, request, response, error case가 실제 route와 일치한다. |
| Permission | 인증 필요 여부, owner/member/admin 권한, 타 사용자 접근 실패 케이스가 테스트된다. |
| Migration | 빈 DB에서 migration up만으로 필요한 schema가 생성된다. |
| Seed | P0 화면 상태를 재현하는 deterministic seed persona가 있다. |
| Integration | Supertest 또는 smoke에서 success/error/auth/permission 케이스가 통과한다. |
| Frontend | 프론트 service endpoint와 response envelope가 일치한다. |
| Evidence | 실행 명령, 날짜, 결과, artifact가 Notion/Test Evidence에 연결된다. |

## Seed Personas

P0 하네스에는 최소 persona가 필요하다.

| Persona | 용도 |
| --- | --- |
| owner | 모집글 작성자, 프로젝트 owner, 지원자 승인/거절 |
| applicant | 모집글 지원/취소, 승인 후 프로젝트 참여 |
| teammate | 프로젝트 멤버, Todo/회의록/일정/평가 |
| otherSchool | 학교 필터와 접근 제한 |
| unverified | 학교 인증 전 제한 상태 |
| admin | 관리 API 또는 운영 확인 |

## P0 Smoke Scope

Prod smoke는 read-only 위주로 제한한다. write smoke는 staging 또는 전용 smoke namespace에서만 실행한다.

Read-only prod smoke:

```text
GET /health
POST /auth/login
GET /auth/me
GET /recruitments
GET /recruitments/{id}
GET /profile/detail
GET /notifications
```

Staging write smoke:

```text
application create/cancel/approve/reject
todo create/complete/activity-log
meeting create/update/delete
schedule create/update/delete
review submit/duplicate guard
scrap create/delete
```

## Known P0 Contract Decisions

| Decision | Required outcome |
| --- | --- |
| SMS code length | 프론트, 백엔드, Swagger, 테스트가 4자리 또는 6자리 중 하나로 통일된다. |
| Application approved enum | `APPROVED` 또는 `ACCEPTED` 중 하나로 모델/컨트롤러/프론트가 통일된다. |
| Schedule contract | `/schedule/project/{project_id}`와 frontend `upcoming` 요구를 어떻게 맞출지 결정한다. |
| Todo contract | dashboard todo 호출과 project-scoped todo route를 어떻게 연결할지 결정한다. |
| Notification contract | project notification과 global notification route를 구분한다. |
| Migration source | app DB config와 Sequelize CLI config를 하나의 운영 기준으로 맞춘다. |

## Local Commands

```bash
cd /Users/_woo_s.j/Desktop/woo/workspace/teamitaka/teamitakaBackend
npm test -- --runInBand
node scripts/completion/route-openapi-drift.mjs --allowlist completion-baseline/route-openapi-drift-allowlist.json
```

`route-openapi-drift.mjs`는 Express route와 Swagger path의 drift를 찾는 정적 하네스다. 정규식 기반이므로 100% 파서가 아니라 drift 발견용 안전망으로 사용한다.

Strict gate:

```bash
node scripts/completion/route-openapi-drift.mjs \
  --allowlist completion-baseline/route-openapi-drift-allowlist.json \
  --strict
```

현재 allowlist는 개발 전용 route만 허용한다. 제품 route drift를 allowlist에 넣으려면 Notion Decision ID와 제거 예정일이 있어야 한다.

## Permission Harness Gate

권한 리팩토링은 “라우트에 `authMiddleware`가 있다”만으로 완료 처리하지 않는다. 각 P0 도메인은 최소 1개 이상의 negative oracle을 가져야 한다.

| Domain | Required negative oracle | Harness file |
| --- | --- | --- |
| Recruitment | 작성자가 아닌 사용자는 모집글 수정/삭제를 할 수 없다. | `tests/recruitmentOwnerContract.test.js` |
| Applications | 작성자가 아닌 사용자는 지원자 목록과 지원자 PII를 조회할 수 없다. | `tests/recruitmentOwnerContract.test.js` |
| Project kickoff | 작성자가 아닌 사용자는 모집글을 프로젝트로 전환할 수 없다. | `tests/recruitmentOwnerContract.test.js` |
| Reviews | 프로젝트 멤버가 아닌 사용자는 리뷰 작성/조회/요약 조회를 할 수 없다. | `tests/reviewContract.test.js` |
| Project internals | 프로젝트 멤버가 아닌 사용자는 todo, meeting, schedule, timeline, feed를 읽거나 쓸 수 없다. | `tests/frontendContract.api.test.js` 또는 전용 contract test |

권한 하네스의 원칙:

- success path보다 먼저 forbidden path를 테스트한다.
- forbidden path에서는 DB mutation 함수가 호출되지 않아야 한다.
- path parameter의 `user_id`, `reviewer_id`, `project_id`는 신뢰하지 않고 JWT actor와 비교한다.
- `401`은 인증 없음, `403`은 인증은 됐지만 권한 없음으로 구분한다.
- 배포 smoke가 green이어도 local permission negative oracle이 없으면 완료가 아니다.
