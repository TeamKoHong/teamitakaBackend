require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "teamitaka_database",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.GCP_DB_USER || "root",
    password: process.env.GCP_DB_PASSWORD || "",  // IAM 인증 사용자는 비밀번호 사용 안 함
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: "127.0.0.1", // Cloud SQL Auth Proxy를 통해 로컬에서 연결
    port: 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false, // Cloud SQL SSL 사용 시 필요
      },
    },
    logging: false,
  },
};
