// src/config/db.js
require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME || "test_db", // ✅ 기본값 설정
  process.env.DB_USER || "root",
  process.env.DB_PASSWORD || "",
  {
    host: process.env.DB_HOST || "127.0.0.1",
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
  if (process.env.NODE_ENV === "test") {
    console.log("🚀 Running in test mode - Skipping DB connection");
    return;
  }

  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1); // 서버 구동 시 DB 연결 실패 → 프로세스 종료
  }
};

// ✅ 테스트 환경에서는 DB 연결을 완전히 제거
connectDB();

module.exports = { sequelize, connectDB };
