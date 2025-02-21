require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "teamitaka_database",
    host: process.env.DB_HOST || "127.0.0.1",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.DB_USER || "iam_user",
    password: process.env.DB_PASSWORD || "Teamitaka123!",
    database: process.env.DB_NAME || "teamitaka_database",
    host: process.env.DB_HOST || "35.223.147.232",
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: false
    },
    logging: console.log,  // 디버깅용 로그 활성화
  },
};