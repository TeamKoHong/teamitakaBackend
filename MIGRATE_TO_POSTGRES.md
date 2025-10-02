# MySQL → PostgreSQL 마이그레이션 가이드

로컬 개발 환경을 MySQL에서 PostgreSQL로 전환하여 Supabase 배포 환경과 동일하게 구성합니다.

## 🎯 왜 PostgreSQL로 전환하나요?

1. **환경 일관성**: Supabase 배포 환경이 PostgreSQL을 사용합니다.
2. **개발/운영 동일성**: 로컬과 운영 환경의 SQL 차이로 인한 버그 방지
3. **고급 기능**: PostgreSQL의 JSON, UUID, 트랜잭션 등 강력한 기능 활용

## 📋 사전 요구사항

- PostgreSQL 15 이상 설치
- Node.js 18 이상
- 기존 MySQL 데이터 백업 (필요시)

## 🚀 마이그레이션 실행

### 자동 마이그레이션 (권장)

```bash
./migrate-to-postgres.sh
```

스크립트가 자동으로:
- PostgreSQL 설치 확인
- 데이터베이스 생성
- 스키마 적용
- .env 파일 생성
- 필요한 패키지 확인

### 수동 마이그레이션

#### 1. PostgreSQL 설치

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
https://www.postgresql.org/download/windows/

#### 2. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE teamitaka_database;

# 종료
\q
```

#### 3. 스키마 적용

```bash
psql -U postgres -d teamitaka_database -f supabase_clean_start.sql
```

또는 GUI 도구 사용:
- pgAdmin
- DBeaver
- Postico (macOS)

#### 4. Node.js 패키지 설치

```bash
npm install pg pg-hstore
```

#### 5. .env 파일 업데이트

```bash
# 기존 .env 백업
cp .env .env.mysql.backup

# .env 파일 수정
NODE_ENV=development
PORT=3000

# PostgreSQL 설정
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=teamitaka_database
DB_DIALECT=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=3600

# SendGrid
SENDGRID_API_KEY=your-sendgrid-api-key
EMAIL_FROM=noreply@teamitaka.com

# Supabase (선택사항)
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# CORS
CORS_ORIGINS=https://www.teamitaka.com,http://localhost:3000
```

#### 6. 서버 실행

```bash
npm run dev
```

## ✅ 마이그레이션 확인

### 1. 연결 확인

서버 시작 시 다음 로그가 나타나야 합니다:

```
🔍 Environment variables:
NODE_ENV: development
DB_HOST: localhost
DB_DIALECT: postgres
✅ Database connection established.
```

### 2. 테이블 확인

```bash
psql -U postgres -d teamitaka_database

# 테이블 목록
\dt

# 예상 출력:
#  users
#  email_verifications
#  projects
#  project_members
#  recruitments
#  ...
```

### 3. API 테스트

```bash
# Health check
curl http://localhost:3000/api/health

# 회원가입 테스트
curl -X POST http://localhost:3000/api/auth/send-verification \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

## 🔄 MySQL로 롤백

문제가 발생하면 MySQL로 다시 전환:

```bash
# .env 복구
mv .env.mysql.backup .env

# 서버 재시작
npm run dev
```

## 📊 MySQL vs PostgreSQL 주요 차이점

| 항목 | MySQL | PostgreSQL |
|------|-------|------------|
| UUID | CHAR(36) | UUID |
| ENUM | ENUM('A', 'B') | VARCHAR + CHECK |
| DATETIME | DATETIME | TIMESTAMP WITH TIME ZONE |
| 자동 증가 | AUTO_INCREMENT | SERIAL / IDENTITY |
| 대소문자 | 대소문자 구분 안함 (기본) | 대소문자 구분 |

## 🛠️ 문제 해결

### "psql: command not found"

PostgreSQL이 설치되지 않았거나 PATH에 없습니다.

**macOS:**
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### "FATAL: role 'postgres' does not exist"

PostgreSQL 사용자 생성:
```bash
createuser -s postgres
```

### "permission denied for database"

권한 부여:
```bash
psql -U postgres -c "ALTER USER postgres WITH SUPERUSER;"
```

### "Port 5432 already in use"

다른 PostgreSQL 인스턴스가 실행 중:
```bash
# macOS
brew services list
brew services stop postgresql@14  # 다른 버전 중지

# Linux
sudo systemctl status postgresql
sudo systemctl stop postgresql
```

### Sequelize 연결 오류

1. `DB_DIALECT=postgres`가 `.env`에 설정되어 있는지 확인
2. `pg` 패키지가 설치되어 있는지 확인: `npm list pg`
3. PostgreSQL 서비스가 실행 중인지 확인: `pg_isready`

## 📚 추가 리소스

- [PostgreSQL 공식 문서](https://www.postgresql.org/docs/)
- [Sequelize PostgreSQL 가이드](https://sequelize.org/docs/v6/other-topics/dialect-specific-things/#postgresql)
- [Supabase 문서](https://supabase.com/docs)

## 💡 팁

1. **GUI 도구 사용**: pgAdmin, DBeaver, Postico로 DB를 시각적으로 관리
2. **로컬 Supabase**: `supabase start`로 로컬에서 전체 Supabase 스택 실행 가능
3. **Docker 사용**: Docker Compose로 PostgreSQL 컨테이너 실행 (포트 충돌 없음)

## 🆘 도움이 필요하신가요?

이슈가 발생하면:
1. 에러 로그 전체 복사
2. `node --version`, `psql --version` 출력
3. `.env` 파일 내용 (민감 정보 제외)
4. 팀에 공유

