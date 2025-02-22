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
    use_env_variable: "DATABASE_URL", // Sequelize가 DATABASE_URL을 직접 사용하도록
    dialect: "mysql",
    dialectOptions: {
      ssl: false,
      host: "127.0.0.1", // IPv4 강제
    },
    logging: console.log,
  },
};