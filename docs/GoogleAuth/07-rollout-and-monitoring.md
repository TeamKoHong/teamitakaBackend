# Step 7 - Rollout & Monitoring

## Rollout
- Phase 1: code merged with GOOGLE_LOGIN_ENABLED=false
- Phase 2: enable on staging, run end-to-end
- Phase 3: enable on prod during low-traffic window

## Rollback
- Toggle feature flag to false
- If necessary, revert PR

## Monitoring
- Metrics: login success rate, 4xx/5xx on auth endpoints, rate-limit hit rate
- Logs: error categories Unauthorized/ProviderUnavailable
- Alerts: sustained failure > threshold

## Acceptance Criteria
- Flag-based enable/disable validated
- Dashboards/alerts configured

---

## 한국어 버전

### 롤아웃
- 1단계: `GOOGLE_LOGIN_ENABLED=false` 상태로 코드 병합
- 2단계: 스테이징에서 활성화 후 E2E 점검
- 3단계: 트래픽이 적은 시간대에 프로덕션 활성화

### 롤백
- 기능 플래그를 false로 전환
- 필요 시 PR 되돌리기

### 모니터링
- 지표: 로그인 성공률, 인증 엔드포인트 4xx/5xx, 레이트리밋 히트율
- 로그: 에러 카테고리(Unauthorized/ProviderUnavailable)
- 알림: 임계치 이상 지속 시 경보

### 승인 기준
- 플래그 on/off가 유효하게 동작함
- 대시보드/알림 구성 완료