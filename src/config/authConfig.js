require("dotenv").config();
const bcrypt = require("bcryptjs");

// ✅ 환경 변수 검증 (없으면 CI 실패하도록 설정)
if (!process.env.ADMIN_PASSWORD_HASH) {
  console.error("❌ ERROR: ADMIN_PASSWORD_HASH 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH, // ✅ 미리 해싱된 비밀번호 사용
  comparePassword: (inputPassword) => {
    return bcrypt.compareSync(inputPassword, process.env.ADMIN_PASSWORD_HASH);
  }
};
