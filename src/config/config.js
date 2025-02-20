require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "teamitaka_database",
    host: process.env.DB_HOST || "127.0.0.1", // IPv4 명시
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.GCP_DB_USER || "root",
    password: process.env.GCP_DB_PASSWORD || "",
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    // Cloud SQL Proxy 사용 시, USE_CLOUD_SQL_PROXY가 "true"이면 127.0.0.1, 그렇지 않으면 GCP_DB_HOST 또는 기본 "mysql" 사용
    host: process.env.USE_CLOUD_SQL_PROXY === "true" ? "127.0.0.1" : (process.env.GCP_DB_HOST || "mysql"),
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: false
    },
    logging: false,
  },  
};
