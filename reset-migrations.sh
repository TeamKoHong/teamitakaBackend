#!/bin/bash

set -e

# ✨ 이 부분이 변경됩니다! ✨
# 이전: echo "🔄 [1/4] Undoing all existing migrations..."
# 이전: npx sequelize-cli db:migrate:undo:all --url "$DATABASE_URL" --debug || {
# 이전:   echo "❌ Failed to undo migrations"
# 이전:   exit 1
# 이전: }

echo "⚠️ [1/3] Dropping all tables in the database..."
# 🚨🚨🚨 중요 경고: 이 명령은 CI/CD 환경 (테스트용)에서 깨끗한 시작을 위해 사용됩니다. 🚨🚨🚨
# 🚨🚨🚨 실제 운영 데이터베이스나 중요한 데이터가 있는 개발 데이터베이스에는 절대 사용하지 마십시오! 🚨🚨🚨
npx sequelize-cli db:drop --url "$DATABASE_URL" || {
  echo "❌ Failed to drop database tables"
  exit 1
}
echo "✅ All tables dropped successfully."

echo "🚀 [2/3] Running latest full migration..."
# db:drop을 했으므로, db:migrate는 모든 테이블을 새로 생성할 것입니다.
npx sequelize-cli db:migrate --url "$DATABASE_URL" --debug || {
  echo "❌ Failed to apply full migration"
  exit 1
}
echo "✅ Full migration applied successfully."

echo "🔍 [3/3] Checking migration status..."
npx sequelize-cli db:migrate:status --url "$DATABASE_URL"

echo "🎉 Migration reset complete."