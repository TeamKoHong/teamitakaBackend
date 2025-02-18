// src/config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false,
    timezone: "+09:00",
    dialectOptions: {
      charset: "utf8mb4",
    },
    define: {
      collate: "utf8mb4_unicode_ci",
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1); // 서버 구동 시 DB 연결 실패 → 프로세스 종료
  }
};

// ✅ 테스트 환경에서는 DB 연결을 완전히 제거
if (process.env.NODE_ENV !== "test") {
  connectDB();
} else {
  console.log("🚀 Running in test mode - Skipping DB connection");
}

module.exports = { sequelize, connectDB };
