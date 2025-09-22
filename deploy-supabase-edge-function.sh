#!/bin/bash

echo "🚀 Supabase Edge Function 배포 스크립트"
echo "======================================"
echo ""
echo "📋 배포 정보:"
FUNCTION_NAME="${FUNCTION_NAME:-teamitaka-api}"
PROJECT_REF="${PROJECT_REF}"
ORIGIN_ALLOWED="${ORIGIN_ALLOWED:-https://www.teamitaka.com}"
if [ -z "$PROJECT_REF" ]; then
  echo "❌ PROJECT_REF 환경변수가 필요합니다 (예: huwajjafqbfrcxkdfker)."
  echo "   export PROJECT_REF=\"<your-project-ref>\""
  exit 1
fi
BASE_URL="https://${PROJECT_REF}.supabase.co/functions/v1/${FUNCTION_NAME}"
echo "- 함수 이름: ${FUNCTION_NAME}"
echo "- Supabase 프로젝트: ${PROJECT_REF}"
echo "- 배포 URL: ${BASE_URL}"
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
FUNCTION_DIR="supabase/functions/${FUNCTION_NAME}"
# 개발 디렉터리는 teamitaka-api로 고정되어 있을 수 있으므로 폴백 처리
if [ ! -f "$FUNCTION_DIR/index.ts" ]; then
  if [ -f "supabase/functions/teamitaka-api/index.ts" ]; then
    FUNCTION_DIR="supabase/functions/teamitaka-api"
  else
    echo "❌ 함수 소스가 없습니다: $FUNCTION_DIR/index.ts"
    exit 1
  fi
fi

echo "🚀 함수 배포 실행..."
./supabase-cli functions deploy "$FUNCTION_NAME" --project-ref "$PROJECT_REF" --no-verify-jwt | cat

echo "✅ 배포 완료 후 테스트:"
echo "curl -s -X GET '${BASE_URL}/api/health' | jq ."
echo ""
echo "📧 이메일 인증 테스트:"
TEST_EMAIL="${TEST_EMAIL:-test@example.com}"
echo "curl -s -X POST '${BASE_URL}/api/auth/send-verification' \
  -H 'Content-Type: application/json' \
  -H 'Origin: ${ORIGIN_ALLOWED}' \
  -d '{\"email\":\"${TEST_EMAIL}\"}' | jq ."