require("dotenv").config();
const { Sequelize } = require("sequelize");

// 🛠 DATABASE_URL이 비어 있는 경우 기본값 설정
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set! Using fallback local database...");
  process.env.DATABASE_URL = "mysql://root:password@127.0.0.1:3306/teamitaka_database";
}

// 🛠 Sequelize 인스턴스 생성 시 예외처리 추가
let sequelize;
try {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
    logging: false,
  });
  console.log("✅ Successfully connected to the database.");
} catch (error) {
  console.error("❌ Failed to initialize Sequelize:", error);
  process.exit(1);
}

// 🛠 Users 테이블 존재 여부 확인
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
