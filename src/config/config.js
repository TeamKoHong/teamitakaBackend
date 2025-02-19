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
    // Cloud SQL Auth Proxy가 127.0.0.1:3306에서 실행되므로 호스트를 127.0.0.1로 고정합니다.
    // IAM 인증 사용자이므로 비밀번호는 빈 문자열("")입니다.
    username: process.env.GCP_DB_USER || "iam_user",
    password: "",
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    logging: false,
  },
};
