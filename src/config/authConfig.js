require("dotenv").config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET || "default-secret-key",
  adminEmail: process.env.ADMIN_EMAIL || "admin@teamitaka.com",
  adminPassword: process.env.ADMIN_PASSWORD, // ⚠️ bcrypt 해싱된 비밀번호를 저장해야 함!
};
