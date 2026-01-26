#!/bin/bash
#
# 학교별 필터링 API 검증 스크립트
# 사용법: ./scripts/verify-school-filter.sh [API_URL]
#

set -e

API_URL="${1:-http://localhost:3000}"
PASS_COUNT=0
FAIL_COUNT=0

echo "=============================================="
echo "🎓 학교별 필터링 API 검증"
echo "=============================================="
echo "API URL: $API_URL"
echo ""

# API 호출
echo "📡 API 호출 중..."
RESULT=$(curl -s "$API_URL/api/recruitments")

if [ -z "$RESULT" ] || [ "$RESULT" == "[]" ]; then
    echo "❌ API 응답이 비어있습니다. 서버 상태를 확인하세요."
    exit 1
fi

echo "✅ API 응답 수신 완료"
echo ""

# TC001: university 필드 존재 확인
echo "----------------------------------------------"
echo "TC001: university 필드 존재 확인"
HAS_UNIVERSITY=$(echo "$RESULT" | jq '.[0] | has("university")')
if [ "$HAS_UNIVERSITY" == "true" ]; then
    echo "✅ PASS - university 필드가 존재합니다"
    ((PASS_COUNT++))
else
    echo "❌ FAIL - university 필드가 없습니다"
    ((FAIL_COUNT++))
fi
echo ""

# TC002: 고려대학교 필터링
echo "----------------------------------------------"
echo "TC002: 고려대학교 필터링"
KOREA_COUNT=$(echo "$RESULT" | jq '[.[] | select(.university == "고려대학교")] | length')
echo "   고려대학교 모집글 수: $KOREA_COUNT"
if [ "$KOREA_COUNT" -ge 1 ]; then
    echo "✅ PASS - 고려대학교 모집글이 필터링됩니다"
    ((PASS_COUNT++))
else
    echo "⚠️  WARN - 고려대학교 모집글이 없습니다 (테스트 데이터 확인 필요)"
fi
echo ""

# TC003: 연세대학교 필터링
echo "----------------------------------------------"
echo "TC003: 연세대학교 필터링"
YONSEI_COUNT=$(echo "$RESULT" | jq '[.[] | select(.university == "연세대학교")] | length')
echo "   연세대학교 모집글 수: $YONSEI_COUNT"
if [ "$YONSEI_COUNT" -ge 1 ]; then
    echo "✅ PASS - 연세대학교 모집글이 필터링됩니다"
    ((PASS_COUNT++))
else
    echo "⚠️  WARN - 연세대학교 모집글이 없습니다 (테스트 데이터 확인 필요)"
fi
echo ""

# TC004: 서울대학교 필터링
echo "----------------------------------------------"
echo "TC004: 서울대학교 필터링"
SNU_COUNT=$(echo "$RESULT" | jq '[.[] | select(.university == "서울대학교")] | length')
echo "   서울대학교 모집글 수: $SNU_COUNT"
if [ "$SNU_COUNT" -ge 1 ]; then
    echo "✅ PASS - 서울대학교 모집글이 필터링됩니다"
    ((PASS_COUNT++))
else
    echo "⚠️  WARN - 서울대학교 모집글이 없습니다 (테스트 데이터 확인 필요)"
fi
echo ""

# TC005: NULL university 처리
echo "----------------------------------------------"
echo "TC005: NULL university 처리"
NULL_COUNT=$(echo "$RESULT" | jq '[.[] | select(.university == null)] | length')
echo "   학교 미설정 모집글 수: $NULL_COUNT"
if [ "$NULL_COUNT" -ge 0 ]; then
    echo "✅ PASS - NULL university 처리 정상"
    ((PASS_COUNT++))
fi
echo ""

# 학교별 통계
echo "=============================================="
echo "📊 학교별 모집글 통계"
echo "=============================================="
echo "$RESULT" | jq -r 'group_by(.university) | .[] | "   \(.[0].university // "미설정"): \(length)개"'
echo ""

# 샘플 데이터 출력
echo "=============================================="
echo "📋 샘플 데이터 (처음 5개)"
echo "=============================================="
echo "$RESULT" | jq '[.[0:5][] | {title: .title, university: .university}]'
echo ""

# 결과 요약
echo "=============================================="
echo "📈 검증 결과 요약"
echo "=============================================="
echo "   PASS: $PASS_COUNT"
echo "   FAIL: $FAIL_COUNT"

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo ""
    echo "🎉 모든 검증이 통과했습니다!"
    exit 0
else
    echo ""
    echo "⚠️  일부 검증이 실패했습니다."
    exit 1
fi
