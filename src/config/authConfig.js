const bcrypt = require("bcryptjs");
require("dotenv").config();

// ✅ 환경 변수 검증 (없으면 CI 실패하도록 설정)
if (!process.env.ADMIN_PASSWORD) {
  console.error("❌ ERROR: ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.");
  process.exit(1); // ❗ 프로세스를 종료하여 CI 실패 유도
}

// ✅ .env에서 가져온 원본 비밀번호를 해싱
const hashedAdminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
  adminPassword: hashedAdminPassword, // ✅ 환경변수에서 가져온 비밀번호를 자동으로 해싱
};