require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";

console.log("🔍 Environment variables:");
console.log("NODE_ENV:", env);
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER ? "SET" : "NOT SET");
console.log("DB_PASSWORD:", process.env.DB_PASSWORD ? "SET" : "NOT SET");
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_PORT:", process.env.DB_PORT || "3306");

// DB_* 환경변수들을 사용하여 연결 설정
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
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

// 필수 환경변수 확인 (앱 시작 시에는 에러를 발생시키지 않음)
const hasRequiredEnvVars = dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database;

if (!hasRequiredEnvVars) {
  console.warn("⚠️  Required database environment variables are missing!");
  console.warn("Required: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
  console.warn("Available environment variables:", Object.keys(process.env).filter(key => key.includes('DB')));
  console.warn("Database connection will fail when attempted.");
}

// Sequelize 인스턴스 생성 (환경변수가 없어도 생성)
const sequelize = new Sequelize(
  dbConfig.database || 'dummy',
  dbConfig.user || 'dummy',
  dbConfig.password || 'dummy',
  {
    host: dbConfig.host || 'localhost',
    port: dbConfig.port,
    dialect: dbConfig.dialect,
    logging: hasRequiredEnvVars ? dbConfig.logging : false, // 환경변수가 없으면 로깅 비활성화
    dialectOptions: dbConfig.dialectOptions,
    define: dbConfig.define
  }
);

const connectDB = async () => {
  if (!hasRequiredEnvVars) {
    console.error("❌ Cannot connect to database: Required environment variables are missing");
    return false;
  }

  try {
    console.log("🔗 Creating Sequelize connection with config:", {
      host: dbConfig.host,
      user: dbConfig.user,
      database: dbConfig.database,
      port: dbConfig.port
    });
    
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