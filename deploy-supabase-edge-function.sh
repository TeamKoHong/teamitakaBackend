#!/bin/bash

echo "🚀 Supabase Edge Function 배포 스크립트"
echo "======================================"
echo ""
echo "📋 배포 정보:"
echo "- 함수 이름: teamitaka-api"
echo "- Supabase 프로젝트: your-project-ref"
echo "- 배포 URL: https://your-project-ref.supabase.co/functions/v1/teamitaka-api"
echo ""
echo "📝 배포 모드: Supabase CLI로 직접 배포"
echo ""
if ! command -v ./supabase-cli >/dev/null 2>&1; then
  echo "❌ supabase-cli 바이너리가 없습니다. 프로젝트 루트의 'supabase-cli'를 사용하도록 준비해주세요."
  echo "   또는 로컬에 supabase를 설치하고 PATH에 추가하세요."
  exit 1
fi

if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ SUPABASE_ACCESS_TOKEN 환경변수가 필요합니다."
  echo "   https://app.supabase.com/account/tokens 에서 토큰 생성 후:"
  echo "   export SUPABASE_ACCESS_TOKEN=\"<your-token>\""
  exit 1
fi

echo "🔐 Supabase 로그인 확인..."
./supabase-cli login --token "$SUPABASE_ACCESS_TOKEN" | cat

echo "📦 함수 파일 확인..."
FUNCTION_DIR="supabase/functions/teamitaka-api"
if [ ! -f "$FUNCTION_DIR/index.ts" ]; then
  echo "❌ 함수 소스가 없습니다: $FUNCTION_DIR/index.ts"
  exit 1
fi

echo "🚀 함수 배포 실행..."
./supabase-cli functions deploy teamitaka-api --project-ref your-project-ref --no-verify-jwt | cat

echo "✅ 배포 완료 후 테스트:"
echo "curl -s -X GET 'https://your-project-ref.supabase.co/functions/v1/teamitaka-api/api/health' | jq ."
echo ""
echo "📧 이메일 인증 테스트:"
echo "curl -s -X POST 'https://your-project-ref.supabase.co/functions/v1/teamitaka-api/api/auth/send-verification' \
  -H 'Content-Type: application/json' \
  -H 'Origin: https://www.teamitaka.com' \
  -d '{\"email\":\"test@example.com\"}' | jq ."
