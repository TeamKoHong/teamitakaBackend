// 환경 변수 로더
const path = require('path');
const fs = require('fs');

// .env 파일 로드
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  const envSupabasePath = path.join(process.cwd(), 'env.supabase');
  
  if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('✅ .env 파일이 로드되었습니다.');
  } else if (fs.existsSync(envSupabasePath)) {
    require('dotenv').config({ path: envSupabasePath });
    console.log('✅ env.supabase 파일이 로드되었습니다.');
  } else {
    console.log('⚠️  .env 또는 env.supabase 파일을 찾을 수 없습니다. 환경 변수를 확인하세요.');
  }
}

// 환경별 설정 로드
function loadConfig() {
  const env = process.env.NODE_ENV || 'development';
  
  try {
    const configPath = path.join(process.cwd(), 'config', `${env}.js`);
    
    if (fs.existsSync(configPath)) {
      const config = require(configPath);
      console.log(`✅ ${env} 환경 설정이 로드되었습니다.`);
      return config;
    } else {
      console.log(`⚠️  ${env} 환경 설정 파일을 찾을 수 없습니다.`);
      return {};
    }
  } catch (error) {
    console.error('❌ 설정 파일 로드 중 오류:', error.message);
    return {};
  }
}

// 필수 환경 변수 검증
function validateRequiredEnvVars() {
  const requiredVars = [
    'NODE_ENV',
    'PORT',
    'DB_HOST',
    'DB_PASSWORD',
    'JWT_SECRET',
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ 필수 환경 변수가 누락되었습니다:', missingVars.join(', '));
    console.error('💡 env.example 파일을 참고하여 .env 파일을 생성하세요.');
    process.exit(1);
  }
  
  console.log('✅ 모든 필수 환경 변수가 설정되었습니다.');
}

// 민감한 정보 마스킹
function maskSensitiveInfo(value) {
  if (!value) return 'NOT_SET';
  if (value.length <= 8) return '***';
  return value.substring(0, 4) + '***' + value.substring(value.length - 4);
}

// 환경 변수 상태 출력 (디버그용)
function printEnvStatus() {
  if (process.env.NODE_ENV === 'development') {
    console.log('\n🔧 환경 변수 상태:');
    console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`PORT: ${process.env.PORT}`);
    console.log(`DB_HOST: ${process.env.DB_HOST}`);
    console.log(`DB_PASSWORD: ${maskSensitiveInfo(process.env.DB_PASSWORD)}`);
    console.log(`JWT_SECRET: ${maskSensitiveInfo(process.env.JWT_SECRET)}`);
    console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL}`);
    console.log(`SENDGRID_API_KEY: ${maskSensitiveInfo(process.env.SENDGRID_API_KEY)}`);
    console.log('');
  }
}

module.exports = {
  loadEnvFile,
  loadConfig,
  validateRequiredEnvVars,
  maskSensitiveInfo,
  printEnvStatus,
};
