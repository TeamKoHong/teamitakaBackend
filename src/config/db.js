require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";

// 환경 변수 출력 (디버깅용)
console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_NAME:", process.env.DB_NAME);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_PORT:", process.env.DB_PORT);

let sequelize;

if (env === "production") {
  // Production 환경 설정
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
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
} else {
  // Development 환경 설정 (config 파일 사용)
  const config = require("./config")[env];

  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    {
      host: config.host,
      port: config.port || 3306,
      dialect: config.dialect,
      logging: false,
      dialectOptions: config.dialectOptions || { charset: "utf8mb4" },
      define: {
        collate: "utf8mb4_unicode_ci",
      },
    }
  );
}

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
