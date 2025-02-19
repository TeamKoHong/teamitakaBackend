require("dotenv").config();

const isCloudEnv = process.env.NODE_ENV === "production";

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
    username: isCloudEnv ? (process.env.GCP_DB_USER || "root") : (process.env.DB_USER || "root"),
    password: isCloudEnv ? (process.env.GCP_DB_PASSWORD || "") : (process.env.DB_PASSWORD || ""),
    database: isCloudEnv ? (process.env.GCP_DB_NAME || "teamitaka_database") : (process.env.DB_NAME || "teamitaka_database"),
    host: isCloudEnv ? (process.env.GCP_DB_HOST || "127.0.0.1") : (process.env.DB_HOST || "127.0.0.1"),
    port: isCloudEnv ? (process.env.GCP_DB_PORT || 3306) : (process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: false,
  },
};
