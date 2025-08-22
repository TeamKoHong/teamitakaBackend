# Step 3 - Model & Migration Plan

## Users table changes
- Add columns:
  - `google_id` VARCHAR(255) UNIQUE NULL
  - `provider` ENUM('LOCAL','GOOGLE') DEFAULT 'LOCAL' NOT NULL
  - `profileImageUrl` VARCHAR(255) NULL (optional)

## Data migration
- Existing rows: `provider` set to 'LOCAL'
- On Google login: upsert by email; if local exists → link by setting `google_id` and `provider='GOOGLE'`

## Indexes
- UNIQUE(`google_id`), UNIQUE(`email`) already exists; ensure non-conflicting

## Rollback
- Drop added columns (keep data snapshot)

## Acceptance Criteria
- Migration script reviewed (impact, downtime)
- Rollback path documented

---

## 한국어 버전

### Users 테이블 변경
- 컬럼 추가:
  - `google_id` VARCHAR(255) UNIQUE NULL
  - `provider` ENUM('LOCAL','GOOGLE') DEFAULT 'LOCAL' NOT NULL
  - `profileImageUrl` VARCHAR(255) NULL(선택)

### 데이터 마이그레이션
- 기존 행: `provider`를 'LOCAL'로 설정
- Google 로그인 시: 이메일 기반 upsert; 로컬 존재 시 `google_id` 설정 후 `provider='GOOGLE'`로 링크

### 인덱스
- UNIQUE(`google_id`), UNIQUE(`email`) 유지 및 충돌 없도록 점검

### 롤백
- 추가한 컬럼 삭제(스냅샷 보존)

### 승인 기준
- 마이그레이션 스크립트 영향/다운타임 검토 완료
- 롤백 경로 문서화 완료