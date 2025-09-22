#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase Edge Function 배포를 위한 파일 준비
const functionName = 'teamitaka-api';
const functionDir = path.join(__dirname, 'supabase', 'functions', functionName);

console.log('🚀 Supabase Edge Function 배포 준비 중...');

// 함수 디렉토리 확인
if (!fs.existsSync(functionDir)) {
  console.error('❌ Edge Function 디렉토리를 찾을 수 없습니다:', functionDir);
  process.exit(1);
}

// 함수 파일 확인
const indexPath = path.join(functionDir, 'index.ts');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.ts 파일을 찾을 수 없습니다:', indexPath);
  process.exit(1);
}

console.log('✅ Edge Function 파일 준비 완료');
console.log('📁 함수 디렉토리:', functionDir);
console.log('📄 메인 파일:', indexPath);

// 파일 내용 확인
const functionCode = fs.readFileSync(indexPath, 'utf8');
console.log('📊 함수 코드 크기:', functionCode.length, 'bytes');

// 배포 가이드 출력
console.log('\n🎯 Supabase Edge Function 배포 가이드:');
console.log('='.repeat(50));
console.log('1. Supabase 대시보드에 로그인: https://supabase.com/dashboard');
console.log('2. 프로젝트 선택: teamitaka');
console.log('3. 왼쪽 메뉴에서 "Edge Functions" 클릭');
console.log('4. "New Function" 버튼 클릭');
console.log('5. 함수 이름 입력:', functionName);
console.log('6. 코드 복사 및 붙여넣기:');
console.log('   - 파일 경로:', indexPath);
console.log('   - 코드 길이:', functionCode.length, 'bytes');
console.log('7. "Deploy" 버튼 클릭');
console.log('='.repeat(50));

// API URL 출력
const apiUrl = `https://huwajjafqbfrcxkdfker.supabase.co/functions/v1/${functionName}`;
console.log('\n🌐 배포 후 API URL:');
console.log('Base URL:', apiUrl);
console.log('Health Check:', `${apiUrl}/api/health`);
console.log('Email Verification:', `${apiUrl}/api/auth/send-verification`);

console.log('\n📋 프론트엔드 설정 업데이트 필요:');
console.log('REACT_APP_API_BASE_URL=' + apiUrl);

console.log('\n✨ 배포 완료 후 테스트 명령어:');
console.log(`curl -X GET "${apiUrl}/api/health"`);
console.log(`curl -X POST "${apiUrl}/api/auth/send-verification" \\`);
console.log('  -H "Content-Type: application/json" \\');
console.log('  -H "Origin: https://www.teamitaka.com" \\');
console.log('  -d \'{"email":"test@example.com"}\'');

console.log('\n🎉 준비 완료! Supabase 대시보드에서 수동 배포를 진행하세요.');
