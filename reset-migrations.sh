#!/bin/bash

set -e

echo "⚠️ [1/4] Dropping all tables in the database..."
npx sequelize-cli db:drop --url "$DATABASE_URL" || {
  echo "❌ Failed to drop database tables"
  exit 1
}
echo "✅ All tables dropped successfully."

# ✨✨✨ 수정된 단계: --database 인자 제거 ✨✨✨
echo "➕ [2/4] Creating the database via URL parsing..." # 로그 메시지도 명확하게 변경
# `db:create`는 `--database` 인자를 인식하지 못하므로, `DATABASE_URL`에서 데이터베이스 이름을 파싱합니다.
npx sequelize-cli db:create --url "$DATABASE_URL" || {
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