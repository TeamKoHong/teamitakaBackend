require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

// 환경별 데이터베이스 설정
// 프로덕션: SUPABASE_* 변수 사용 (PostgreSQL)
// 개발: DB_* 변수 사용 (MySQL 또는 로컬 PostgreSQL)
const dbHost = isProduction ? process.env.SUPABASE_DB_HOST : process.env.DB_HOST;
const dbUser = isProduction ? process.env.SUPABASE_DB_USER : process.env.DB_USER;
const dbPassword = isProduction ? process.env.SUPABASE_DB_PASSWORD : process.env.DB_PASSWORD;
const dbName = isProduction ? process.env.SUPABASE_DB_NAME : process.env.DB_NAME;
const dbPort = isProduction
  ? (process.env.SUPABASE_DB_PORT || 5432)
  : (process.env.DB_PORT || 3306);
const dbDialect = isProduction ? "postgres" : (process.env.DB_DIALECT || "mysql");

console.log("🔍 Environment variables:");
console.log("NODE_ENV:", env);
console.log("Environment:", isProduction ? "PRODUCTION (using SUPABASE_*)" : "DEVELOPMENT (using DB_*)");
console.log("DB_HOST:", dbHost);
console.log("DB_USER:", dbUser ? "SET" : "NOT SET");
console.log("DB_PASSWORD:", dbPassword ? "SET" : "NOT SET");
console.log("DB_NAME:", dbName);
console.log("DB_PORT:", dbPort);
console.log("DB_DIALECT:", dbDialect);

// 데이터베이스 연결 설정
const dbConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbName,
  port: dbPort,
  dialect: dbDialect,
  logging: console.log, // 디버깅용 로깅 활성화
  dialectOptions: dbDialect === "postgres" ? {
    ssl: {
      require: true,
      rejectUnauthorized: false
    },
    connectTimeout: 30000, // Increased from 10s to 30s for Render cold starts
    // Force IPv4 to avoid IPv6 connection issues on Render
    family: 4,
  } : {
    ssl: false,
    connectTimeout: 30000, // Increased from 10s to 30s
  },
  define: {
    underscored: false
  }
};

// 필수 환경변수 확인 (앱 시작 시에는 에러를 발생시키지 않음)
const hasRequiredEnvVars = dbConfig.host && dbConfig.user && dbConfig.password && dbConfig.database;

if (!hasRequiredEnvVars) {
  console.warn("⚠️  Required database environment variables are missing!");
  if (isProduction) {
    console.warn("Required for PRODUCTION: SUPABASE_DB_HOST, SUPABASE_DB_USER, SUPABASE_DB_PASSWORD, SUPABASE_DB_NAME");
  } else {
    console.warn("Required for DEVELOPMENT: DB_HOST, DB_USER, DB_PASSWORD, DB_NAME");
  }
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
    define: dbConfig.define,
    // Connection pool configuration
    pool: {
      max: 5,          // Maximum 5 connections for Render free tier
      min: 0,          // Minimum connections (0 to save resources)
      acquire: 30000,  // 30 seconds max time to acquire connection
      idle: 10000,     // 10 seconds idle time before releasing connection
    },
    // Retry configuration for connection failures
    retry: {
      max: 5,          // Maximum 5 retry attempts
      timeout: 30000,  // 30 seconds timeout for each retry
      match: [
        /ECONNREFUSED/,  // Connection refused (common on Render)
        /ETIMEDOUT/,     // Connection timeout
        /ECONNRESET/,    // Connection reset
        /EHOSTUNREACH/,  // Host unreachable
      ],
      backoffBase: 1000,      // Start with 1 second delay
      backoffExponent: 1.5,   // Increase delay by 1.5x each retry (1s, 1.5s, 2.25s, 3.375s, 5.0625s)
    },
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