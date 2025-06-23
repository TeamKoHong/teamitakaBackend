require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";

console.log("🔍 Environment variables:");
console.log("NODE_ENV:", env);
console.log("GCP_DB_HOST:", process.env.GCP_DB_HOST);
console.log("GCP_DB_USER:", process.env.GCP_DB_USER ? "SET" : "NOT SET");
console.log("GCP_DB_PASSWORD:", process.env.GCP_DB_PASSWORD ? "SET" : "NOT SET");
console.log("GCP_DB_NAME:", process.env.GCP_DB_NAME);
console.log("GCP_DB_PORT:", process.env.GCP_DB_PORT || "3306");

// GCP_DB_* 환경변수들을 사용하여 연결 설정
const dbConfig = {
  host: process.env.GCP_DB_HOST,
  user: process.env.GCP_DB_USER,
  password: process.env.GCP_DB_PASSWORD,
  database: process.env.GCP_DB_NAME,
  port: process.env.GCP_DB_PORT || 3306,
  dialect: "mysql",
  logging: console.log, // 디버깅용 로깅 활성화
  dialectOptions: {
    ssl: false, // Cloud SQL Proxy가 SSL 처리
    connectTimeout: 10000,
  },
  define: {
    underscored: false
  }
};

// 필수 환경변수 확인
if (!dbConfig.host || !dbConfig.user || !dbConfig.password || !dbConfig.database) {
  console.error("❌ Required database environment variables are missing!");
  console.error("Required: GCP_DB_HOST, GCP_DB_USER, GCP_DB_PASSWORD, GCP_DB_NAME");
  console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('DB')));
  process.exit(1);
}

console.log("🔗 Creating Sequelize connection with config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port
});

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: dbConfig.logging,
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
    return true;
  } catch (err) {
    console.error("❌ Unable to connect to database:", err);
    return false;
  }
};

// 즉시 연결하지 않고 연결 함수만 export
module.exports = { sequelize, connectDB };