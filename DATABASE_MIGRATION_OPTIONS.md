# 데이터베이스 설정 옵션

로컬 개발 환경에서 발생하는 `user_type` 컬럼 에러를 해결하는 방법입니다.

## 🎯 문제 상황

```
Error: Unknown column 'user_type' in 'field list'
```

Sequelize User 모델에는 `user_type` 필드가 있지만, 로컬 MySQL 테이블에는 없어서 발생하는 오류입니다.

---

## 📌 해결 방법 (2가지 선택)

### 옵션 A: MySQL 계속 사용 (빠른 해결) ⚡

**장점:**
- 빠르고 간단 (5분 소요)
- 기존 데이터 유지
- 설정 변경 최소화

**방법:**

```bash
# 전체 스키마 재생성
mysql -u root -p teamitaka_database < mysql_clean_start.sql

# 또는 컬럼만 추가
mysql -u root -p teamitaka_database -e "
ALTER TABLE users 
ADD COLUMN user_type ENUM('ADMIN', 'MEMBER') 
DEFAULT 'MEMBER' 
AFTER password;
"
```

**파일:** `mysql_clean_start.sql`

---

### 옵션 B: PostgreSQL로 전환 (권장) ⭐

**장점:**
- Supabase 배포 환경과 동일
- 개발/운영 환경 일관성
- 고급 DB 기능 활용 가능

**방법:**

```bash
# 자동 마이그레이션 (권장)
./migrate-to-postgres.sh

# 수동 설정
psql -U postgres -c "CREATE DATABASE teamitaka_database;"
psql -U postgres -d teamitaka_database -f supabase_clean_start.sql
```

**파일:** 
- `migrate-to-postgres.sh` (자동 스크립트)
- `supabase_clean_start.sql` (스키마)
- `MIGRATE_TO_POSTGRES.md` (상세 가이드)
- `QUICK_POSTGRES_SETUP.md` (빠른 참조)

---

## 🔍 비교표

| 항목 | MySQL (옵션 A) | PostgreSQL (옵션 B) |
|------|----------------|---------------------|
| **설정 시간** | 5분 | 10-15분 |
| **파일** | `mysql_clean_start.sql` | `supabase_clean_start.sql` |
| **배포 환경과 동일** | ❌ | ✅ |
| **추가 설치** | 불필요 | PostgreSQL 설치 필요 |
| **기존 데이터** | 유지 가능 | 새로 시작 |
| **Supabase 호환** | 부분적 | 완전 |

---

## 💡 추천 시나리오

### 지금 당장 테스트해야 한다면
→ **옵션 A (MySQL)** 사용

### 장기적으로 개발할 예정이라면
→ **옵션 B (PostgreSQL)** 사용

### 팀 전체가 MySQL을 쓴다면
→ **옵션 A (MySQL)** 유지하고 스키마만 동기화

### Supabase 배포를 앞두고 있다면
→ **옵션 B (PostgreSQL)** 로 미리 전환

---

## 📂 관련 파일 목록

```
teamitakaBackend/
├── mysql_clean_start.sql              # MySQL 전체 스키마
├── supabase_clean_start.sql           # PostgreSQL 전체 스키마
├── migrate-to-postgres.sh             # 자동 마이그레이션 스크립트
├── MIGRATE_TO_POSTGRES.md             # PostgreSQL 전환 상세 가이드
├── QUICK_POSTGRES_SETUP.md            # PostgreSQL 빠른 설정
└── DATABASE_MIGRATION_OPTIONS.md      # 이 문서
```

---

## 🚀 빠른 시작

### MySQL 선택 시:
```bash
mysql -u root -p teamitaka_database < mysql_clean_start.sql
npm run dev
```

### PostgreSQL 선택 시:
```bash
./migrate-to-postgres.sh
mv .env.postgres.new .env
npm install pg pg-hstore
npm run dev
```

---

## 📞 추가 도움

- MySQL 상세: 현재 구조 그대로 사용
- PostgreSQL 상세: `MIGRATE_TO_POSTGRES.md` 참고
- 빠른 참조: `QUICK_POSTGRES_SETUP.md` 참고

