require("dotenv").config();
const { Sequelize } = require("sequelize");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set! Using fallback local database...");
  process.env.DATABASE_URL = "mysql://root:password@127.0.0.1:3306/teamitaka_database";
}

let sequelize;
try {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,  // 퍼블릭 IP 연결 시 SSL 필수
        rejectUnauthorized: false  // GCP 기본 SSL 설정
      }
    },
    logging: console.log,  // 연결 디버깅 로그
  });
  console.log("✅ Successfully connected to the database");
} catch (error) {
  console.error("❌ Failed to initialize Sequelize:", error);
  process.exit(1);
}

(async () => {
  try {
    const usersTableExists = await sequelize.getQueryInterface().showAllTables();
    if (usersTableExists.includes("Users")) {
      console.log("✅ Users table exists. Proceeding...");
    } else {
      console.log("⚠️ Users table not found. Migration might be required.");
    }
    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking Users table:", error);
    process.exit(1);
  }
})();