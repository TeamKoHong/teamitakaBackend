require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "teamitaka_database",
    host: process.env.DB_HOST || "127.0.0.1", // IPv6 대신 IPv4 명시
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.GCP_DB_USER || "root",
    password: process.env.GCP_DB_PASSWORD || "",
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: process.env.GCP_DB_HOST || "mysql",
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: false // SSL 비활성화 (Proxy 사용 시)
    },
    logging: false,
  },
};