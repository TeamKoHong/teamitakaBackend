# PostgreSQL 빠른 설정 체크리스트

## 🚀 5분 안에 PostgreSQL로 전환하기

### ✅ 체크리스트

- [ ] PostgreSQL 설치 확인
- [ ] PostgreSQL 서비스 실행
- [ ] 데이터베이스 생성
- [ ] 스키마 적용
- [ ] .env 파일 업데이트
- [ ] Node.js 패키지 설치
- [ ] 서버 재시작
- [ ] API 테스트

---

## 📝 명령어 모음 (복사해서 사용)

### 1단계: PostgreSQL 설치 (macOS)
```bash
brew install postgresql@15
brew services start postgresql@15
```

### 2단계: 자동 마이그레이션 실행
```bash
chmod +x migrate-to-postgres.sh
./migrate-to-postgres.sh
```

### 3단계: .env 적용
```bash
mv .env.postgres.new .env
```

### 4단계: 패키지 설치
```bash
npm install pg pg-hstore
```

### 5단계: 서버 시작
```bash
npm run dev
```

### 6단계: 테스트
```bash
curl http://localhost:3000/api/health
```

---

## 🔧 수동 설정 (자동 스크립트 실패 시)

### DB 생성
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS teamitaka_database;"
psql -U postgres -c "CREATE DATABASE teamitaka_database;"
```

### 스키마 적용
```bash
psql -U postgres -d teamitaka_database -f supabase_clean_start.sql
```

### .env 최소 설정
```bash
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=teamitaka_database
```

---

## ⚡ MySQL 사용자용 (기존 user_type 에러 해결)

PostgreSQL 대신 MySQL 유지하려면:

```bash
mysql -u root -p teamitaka_database < mysql_clean_start.sql
```

또는:

```sql
ALTER TABLE users 
ADD COLUMN user_type ENUM('ADMIN', 'MEMBER') 
DEFAULT 'MEMBER' 
AFTER password;
```

---

## 🆘 자주 발생하는 에러

### "psql: command not found"
```bash
# macOS
export PATH="/opt/homebrew/opt/postgresql@15/bin:$PATH"
```

### "role 'postgres' does not exist"
```bash
createuser -s postgres
```

### "Port 5432 already in use"
```bash
lsof -i :5432
kill -9 [PID]
```

### Sequelize 연결 실패
```bash
# pg 패키지 재설치
npm uninstall pg pg-hstore
npm install pg@8.11.3 pg-hstore
```

---

## ✅ 성공 확인

서버 시작 시 이런 로그가 보이면 성공:

```
🔍 Environment variables:
DB_DIALECT: postgres
✅ Database connection established.
```

---

## 📞 빠른 도움말

| 문제 | 해결 |
|------|------|
| PostgreSQL 없음 | `brew install postgresql@15` |
| 서비스 안 됨 | `brew services start postgresql@15` |
| 권한 오류 | `createuser -s postgres` |
| 포트 충돌 | `lsof -i :5432` 후 프로세스 종료 |
| 연결 실패 | `.env`의 `DB_DIALECT=postgres` 확인 |

---

**전체 가이드**: `MIGRATE_TO_POSTGRES.md` 참고

