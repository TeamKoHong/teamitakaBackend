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
    username: process.env.GCP_DB_USER || "iam_user",
    password: "",  // IAM 인증 사용자이므로 비밀번호 없음
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: "127.0.0.1",  // Cloud SQL Auth Proxy가 리스닝하는 주소
    port: 3306,
    dialect: "mysql",
    logging: false,
  },
};
