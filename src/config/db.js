require("dotenv").config();
const { Sequelize } = require("sequelize");

const isCloudEnv = process.env.NODE_ENV === "production";

const sequelize = new Sequelize(
  isCloudEnv ? process.env.GCP_DB_NAME : process.env.DB_NAME,
  isCloudEnv ? process.env.GCP_DB_USER : process.env.DB_USER,
  isCloudEnv ? process.env.GCP_DB_PASSWORD : process.env.DB_PASSWORD,
  {
    host: isCloudEnv ? process.env.GCP_DB_HOST : process.env.DB_HOST,
    port: isCloudEnv ? process.env.GCP_DB_PORT : process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    timezone: "+09:00",
    dialectOptions: {
      charset: "utf8mb4",
    },
    define: {
      collate: "utf8mb4_unicode_ci",
    },
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1);
  }
};

connectDB();

module.exports = { sequelize };
