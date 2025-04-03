#!/bin/bash

set -e

echo "🔄 [1/4] Undoing all existing migrations..."
npx sequelize-cli db:migrate:undo:all --url "$DATABASE_URL" --debug || {
  echo "❌ Failed to undo migrations"
  exit 1
}

echo "✅ All previous migrations undone."

echo "🚀 [2/4] Running latest full migration..."
npx sequelize-cli db:migrate --url "$DATABASE_URL" --debug || {
  echo "❌ Failed to apply full migration"
  exit 1
}
echo "✅ Full migration applied successfully."

echo "🔍 [3/4] Checking migration status..."
npx sequelize-cli db:migrate:status --url "$DATABASE_URL"

echo "🎉 [4/4] Migration reset complete."