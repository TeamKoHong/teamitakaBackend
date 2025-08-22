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