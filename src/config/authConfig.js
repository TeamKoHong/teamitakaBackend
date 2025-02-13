const bcrypt = require("bcryptjs");
require("dotenv").config();

// ⚠️ 환경 변수 검증 추가
if (!process.env.ADMIN_PASSWORD) {
  throw new Error("❌ ADMIN_PASSWORD 환경 변수가 설정되지 않았습니다.");
}

// ✅ 안전한 기본값 적용 (환경변수 없을 시 예외 발생)
const hashedAdminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
  adminPassword: hashedAdminPassword, // ✅ 해싱된 비밀번호 사용
};
