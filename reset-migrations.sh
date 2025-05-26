#!/bin/bash

set -e

echo "⚠️ [1/4] Dropping all tables in the database..."
npx sequelize-cli db:drop --url "$DATABASE_URL" || {
  echo "❌ Failed to drop database tables"
  exit 1
}
echo "✅ All tables dropped successfully."

# ✨✨✨ 새로 추가된 단계: 데이터베이스 생성 ✨✨✨
echo "➕ [2/4] Creating the database: $DB_NAME..." # $DB_NAME 변수명을 로그에 명시하여 확인 가능
# DB_NAME 환경 변수는 'teamitaka_database' 값을 가지고 있습니다.
# --database 옵션으로 명시적으로 데이터베이스 이름을 전달합니다.
npx sequelize-cli db:create --database "$DB_NAME" --url "$DATABASE_URL" || {
  echo "❌ Failed to create database"
  exit 1
}
echo "✅ Database created successfully."

echo "🚀 [3/4] Running latest full migration..."
npx sequelize-cli db:migrate --url "$DATABASE_URL" --debug || {
  echo "❌ Failed to apply full migration"
  exit 1
}
echo "✅ Full migration applied successfully."

echo "🔍 [4/4] Checking migration status..."
npx sequelize-cli db:migrate:status --url "$DATABASE_URL"

echo "🎉 Migration reset complete."