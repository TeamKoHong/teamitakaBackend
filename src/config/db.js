require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const databaseUrl = process.env.DATABASE_URL;

console.log("🔍 Environment variables:");
console.log("NODE_ENV:", env);
console.log("DATABASE_URL:", databaseUrl ? "SET" : "NOT SET");
console.log("GCP_DB_HOST:", process.env.GCP_DB_HOST);
console.log("GCP_DB_USER:", process.env.GCP_DB_USER ? "SET" : "NOT SET");
console.log("GCP_DB_NAME:", process.env.GCP_DB_NAME);

if (!databaseUrl) {
  console.error("❌ DATABASE_URL is not set!");
  console.error("Available environment variables:", Object.keys(process.env).filter(key => key.includes('DB')));
  process.exit(1);
}

console.log("🔗 Creating Sequelize connection with URL:", databaseUrl.replace(/\/\/.*@/, '//***:***@'));

const sequelize = new Sequelize(databaseUrl, {
  dialect: "mysql",
  logging: console.log, // 디버깅용 로깅 활성화
  dialectOptions: {
    ssl: false, // Cloud SQL Proxy가 SSL 처리
    connectTimeout: 10000,
  },
  define: {
    underscored: false
}});

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