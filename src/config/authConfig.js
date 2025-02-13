require("dotenv").config();
const bcrypt = require("bcryptjs");

// ⚠️ 관리자의 비밀번호를 미리 해싱한 값으로 환경변수에서 불러옴
const hashedAdminPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10);

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
  adminPassword: hashedAdminPassword, // ✅ 해싱된 비밀번호 사용
};
