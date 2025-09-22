#!/bin/bash

# Vercel 배포 스크립트
# GitHub Actions에서 환경 변수를 Vercel에 설정하고 배포

echo "🚀 Vercel 배포 시작..."

# Vercel CLI 설치 (이미 설치되어 있다면 스킵)
if ! command -v vercel &> /dev/null; then
    echo "📦 Vercel CLI 설치 중..."
    npm install -g vercel
fi

# Vercel 로그인 (토큰 사용)
echo "🔐 Vercel 로그인 중..."
vercel --token $VERCEL_TOKEN

# 환경 변수 설정
echo "⚙️ 환경 변수 설정 중..."
vercel env add DB_HOST production <<< "$DB_HOST"
vercel env add DB_NAME production <<< "$DB_NAME"
vercel env add DB_USER production <<< "$DB_USER"
vercel env add DB_PASSWORD production <<< "$DB_PASSWORD"
vercel env add DB_PORT production <<< "$DB_PORT"
vercel env add DB_DIALECT production <<< "postgres"
vercel env add EMAIL_FROM production <<< "$EMAIL_FROM"
vercel env add EMAIL_SERVICE production <<< "$EMAIL_SERVICE"
vercel env add SENDGRID_API_KEY production <<< "$SENDGRID_API_KEY"
vercel env add JWT_SECRET production <<< "$JWT_SECRET"
vercel env add CORS_ORIGIN production <<< "https://www.teamitaka.com"
vercel env add NODE_ENV production <<< "production"

# 배포 실행
echo "🚀 Vercel 배포 실행 중..."
vercel --prod --token $VERCEL_TOKEN

echo "✅ Vercel 배포 완료!"
