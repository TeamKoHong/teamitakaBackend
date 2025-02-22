require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set!");
  process.exit(1);
}

const sequelize = new Sequelize(databaseUrl, {
  dialect: "mysql",
  logging: console.log, // 디버깅용 로깅 활성화
  dialectOptions: {
    ssl: false, // Cloud SQL Proxy가 SSL을 처리
    connectTimeout: 10000, // 타임아웃 증가
    host: "127.0.0.1", // 강제로 IPv4 사용
  },
  host: "127.0.0.1", // 명시적으로 IPv4 설정
});

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Unable to connect:", err);
    process.exit(1);
  }
};

connectDB();
module.exports = { sequelize };