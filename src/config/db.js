const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: false, // SQL 쿼리 로그 비활성화 (개발 시 true로 변경 가능)
  timezone: "+09:00", // 한국 시간대 설정
});

sequelize
  .authenticate()
  .then(() => console.log("✅ Database connection established."))
  .catch((err) => console.error("❌ Unable to connect to the database:", err));

module.exports = sequelize;
