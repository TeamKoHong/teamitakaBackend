// index.js
const { loadEnvFile, validateRequiredEnvVars, printEnvStatus } = require('./src/config/envLoader');

// 환경 변수 로드
loadEnvFile();

// 필수 환경 변수 검증
validateRequiredEnvVars();

// 환경 변수 상태 출력 (개발 환경에서만)
printEnvStatus();

const app = require("./src/app");  // Express 앱
// 여기서 db.js가 필요하다면 import (단, 일반적으로 db.js는 다른 곳에서 import되며,
// NODE_ENV !== 'test' 조건 하에 connectDB()가 이미 실행될 것)

const PORT = process.env.PORT || 8080;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  setInterval(() => console.log('✅ Server still running...'), 5000);
});
