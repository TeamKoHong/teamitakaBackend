require("dotenv").config();
const { Sequelize } = require("sequelize");

// 환경 변수 출력 (디버깅용)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_PORT:", process.env.DB_PORT);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,  // ✅ 여기서 포트 사용
    dialect: "mysql",
    logging: false,
    timezone: "+09:00",
    dialectOptions: {
      charset: process.env.DB_CHARSET || "utf8mb4",
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
    process.exit(1);
  }
};

connectDB();

module.exports = { sequelize };
