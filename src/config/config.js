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
    // Cloud SQL Auth Proxy를 사용하는 경우, 데이터베이스는 항상 로컬(127.0.0.1)을 통해 연결됩니다.
    // IAM 인증 사용자로 설정되어 있으므로, 패스워드는 빈 문자열("")이어야 합니다.
    username: process.env.GCP_DB_USER || "iam_user",
    password: "", // IAM 인증 사용자이므로 비밀번호는 사용하지 않습니다.
    database: process.env.GCP_DB_NAME || "teamitaka_database",
    host: "127.0.0.1",
    port: 3306,
    dialect: "mysql",
    logging: false,
  },
};
