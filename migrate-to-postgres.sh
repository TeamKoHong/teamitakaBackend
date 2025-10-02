#!/bin/bash

# MySQL → PostgreSQL 마이그레이션 스크립트
# 로컬 개발 환경을 Supabase와 동일하게 PostgreSQL로 전환

set -e  # 에러 발생 시 즉시 중단

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 MySQL → PostgreSQL 마이그레이션 시작"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. PostgreSQL 설치 확인
echo "📦 Step 1: PostgreSQL 설치 확인..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL이 설치되어 있지 않습니다."
    echo ""
    echo "설치 방법:"
    echo "  macOS:   brew install postgresql@15"
    echo "  Ubuntu:  sudo apt-get install postgresql postgresql-contrib"
    echo "  Windows: https://www.postgresql.org/download/windows/"
    echo ""
    exit 1
fi
echo "✅ PostgreSQL 설치됨: $(psql --version)"
echo ""

# 2. PostgreSQL 서비스 시작 확인
echo "🔍 Step 2: PostgreSQL 서비스 확인..."
if ! pg_isready &> /dev/null; then
    echo "⚠️  PostgreSQL 서비스가 실행 중이지 않습니다."
    echo ""
    echo "서비스 시작 방법:"
    echo "  macOS:   brew services start postgresql@15"
    echo "  Ubuntu:  sudo systemctl start postgresql"
    echo "  Windows: net start postgresql-x64-15"
    echo ""
    read -p "PostgreSQL을 시작한 후 Enter를 눌러주세요..."
fi
echo "✅ PostgreSQL 서비스 실행 중"
echo ""

# 3. .env 파일 백업
echo "💾 Step 3: .env 파일 백업..."
if [ -f .env ]; then
    cp .env .env.mysql.backup
    echo "✅ .env → .env.mysql.backup"
else
    echo "⚠️  .env 파일이 없습니다."
fi
echo ""

# 4. 데이터베이스 생성
echo "🗄️  Step 4: PostgreSQL 데이터베이스 생성..."
DB_NAME="teamitaka_database"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

# 기존 DB 삭제 (있다면)
echo "기존 데이터베이스 확인 중..."
if psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    echo "⚠️  기존 데이터베이스 발견: $DB_NAME"
    read -p "삭제하고 새로 만들까요? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "DROP DATABASE IF EXISTS $DB_NAME;" || true
        echo "✅ 기존 DB 삭제됨"
    fi
fi

# 새 DB 생성
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME;" 2>/dev/null || echo "ℹ️  DB가 이미 존재하거나 생성 중 오류 발생"
echo "✅ 데이터베이스 생성: $DB_NAME"
echo ""

# 5. 스키마 적용
echo "📋 Step 5: PostgreSQL 스키마 적용..."
if [ -f "(important)_supabase_clean_start.sql" ]; then
    SCHEMA_FILE="(important)_supabase_clean_start.sql"
elif [ -f "supabase_clean_start.sql" ]; then
    SCHEMA_FILE="supabase_clean_start.sql"
else
    echo "❌ PostgreSQL 스키마 파일을 찾을 수 없습니다."
    exit 1
fi

echo "스키마 파일: $SCHEMA_FILE"
psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f "$SCHEMA_FILE"
echo "✅ 스키마 적용 완료"
echo ""

# 6. .env 파일 업데이트
echo "⚙️  Step 6: .env 파일 업데이트..."
cat > .env.postgres.new << EOF
# PostgreSQL 설정 (로컬 개발)
NODE_ENV=development
PORT=3000

# PostgreSQL Database
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD
DB_NAME=$DB_NAME
DB_DIALECT=postgres

# JWT
JWT_SECRET=${JWT_SECRET:-your-super-secret-jwt-key-change-this-in-production}
JWT_EXPIRES_IN=3600

# SendGrid (이메일 인증)
SENDGRID_API_KEY=${SENDGRID_API_KEY:-your-sendgrid-api-key}
EMAIL_FROM=${EMAIL_FROM:-noreply@teamitaka.com}

# Supabase (배포용 - 선택사항)
SUPABASE_URL=${SUPABASE_URL:-}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY:-}

# CORS
CORS_ORIGINS=https://www.teamitaka.com,http://localhost:3000
EOF

echo "✅ 새 .env 파일 생성: .env.postgres.new"
echo ""
echo "다음 명령어로 적용:"
echo "  mv .env.postgres.new .env"
echo ""

# 7. package.json 의존성 확인
echo "📦 Step 7: Node.js 의존성 확인..."
if ! grep -q '"pg"' package.json; then
    echo "⚠️  'pg' 패키지가 package.json에 없습니다."
    echo ""
    echo "다음 명령어로 설치:"
    echo "  npm install pg pg-hstore"
    echo ""
else
    echo "✅ 'pg' 패키지 확인됨"
fi
echo ""

# 8. Sequelize 설정 확인
echo "🔧 Step 8: Sequelize 설정 확인..."
if [ -f "src/config/db.js" ]; then
    if grep -q "dialect.*mysql" src/config/db.js; then
        echo "⚠️  src/config/db.js에서 dialect가 'mysql'로 설정되어 있습니다."
        echo ""
        echo "다음과 같이 수정하세요:"
        echo "  dialect: process.env.DB_DIALECT || 'postgres'"
        echo ""
    else
        echo "✅ Sequelize 설정 확인됨"
    fi
else
    echo "ℹ️  src/config/db.js 파일을 찾을 수 없습니다."
fi
echo ""

# 9. 완료
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 마이그레이션 준비 완료!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "다음 단계:"
echo ""
echo "1. .env 파일 적용:"
echo "   mv .env.postgres.new .env"
echo ""
echo "2. PostgreSQL 드라이버 설치 (필요시):"
echo "   npm install pg pg-hstore"
echo ""
echo "3. Sequelize 설정 업데이트 (src/config/db.js):"
echo "   dialect: process.env.DB_DIALECT || 'postgres'"
echo ""
echo "4. 서버 재시작:"
echo "   npm run dev"
echo ""
echo "5. MySQL 롤백이 필요하면:"
echo "   mv .env.mysql.backup .env"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

