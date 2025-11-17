// index.js
const { loadEnvFile, validateRequiredEnvVars, printEnvStatus } = require('./src/config/envLoader');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 환경 변수 로드
loadEnvFile();

// 필수 환경 변수 검증
validateRequiredEnvVars();

// 환경 변수 상태 출력 (개발 환경에서만)
printEnvStatus();

const app = require("./src/app");  // Express 앱

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// 🔄 Production 환경에서 자동 migration 실행
async function runMigrations() {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🔄 Running production migrations...');
      const { stdout, stderr } = await execPromise('npx sequelize-cli db:migrate');
      console.log('✅ Migrations completed successfully');
      if (stdout) console.log(stdout);
      if (stderr) console.error('Migration warnings:', stderr);
    } catch (error) {
      console.error('❌ Migration execution failed:', error.message);
      console.error('⚠️ Server will start anyway, but database schema may be outdated');
    }
  } else {
    console.log('ℹ️ Skipping auto-migration (not production environment)');
  }
}

// Migration 실행 후 서버 시작
runMigrations().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server listening on ${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    setInterval(() => console.log('✅ Server still running...'), 5000);
  });
}).catch(error => {
  console.error('💥 Critical error during startup:', error);
  process.exit(1);
});
