require('dotenv').config();
const { Sequelize } = require('sequelize');

// 환경 변수에서 DATABASE_URL 가져오기 (없다면 기본값 사용)
const databaseUrl = process.env.DATABASE_URL || "mysql://root:password@127.0.0.1:3306/teamitaka_database";

console.log("🔍 DATABASE_URL:", databaseUrl); // 디버깅용 출력

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'mysql',
  logging: false,
});

async function checkDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
}

checkDB();
