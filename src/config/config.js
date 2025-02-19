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
    // Cloud SQL Auth Proxy를 사용할 경우, 
    // 데이터베이스는 반드시 로컬(IPv4: 127.0.0.1)로 연결되어야 합니다.
    username: process.env.GCP_DB_USER || "root",
    password: process.env.GCP_DB_PASSWORD || "",
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: "127.0.0.1", // 강제로 IPv4 로컬 주소 사용
    port: 3306,       // 표준 포트 사용
    dialect: "mysql",
    logging: false,
  },
};
