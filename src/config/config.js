require("dotenv").config(); // .env 파일을 로드합니다.
const { buildDatabaseConfig, getDatabaseUrl } = require("./databaseConfig");

module.exports = {
  development: buildDatabaseConfig("development"),

  production: buildDatabaseConfig("production"),

  test: buildDatabaseConfig("test"),

  // 공통 설정 (Development/Production 모두 사용 가능)
  auth: {
    univcertApiKey: process.env.UNIVCERT_API_KEY,
    jwtSecret: process.env.JWT_SECRET,
  },

  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    passwordHash: process.env.ADMIN_PASSWORD_HASH, // 안전하게 해시된 비밀번호
  },

  // DSN 형식으로 데이터베이스 URL 생성 (필요 시 Sequelize CLI 사용)
  getDatabaseUrl,
};
