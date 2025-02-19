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
    username: isCloudEnv ? process.env.GCP_DB_USER : process.env.DB_USER,
    password: isCloudEnv ? process.env.GCP_DB_PASSWORD : process.env.DB_PASSWORD,
    database: isCloudEnv ? process.env.GCP_DB_NAME : process.env.DB_NAME,
    host: isCloudEnv ? process.env.GCP_DB_HOST : process.env.DB_HOST,
    port: isCloudEnv ? process.env.GCP_DB_PORT : process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
  },
};
