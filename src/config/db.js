require("dotenv").config();
const { Sequelize } = require("sequelize");

const env = process.env.NODE_ENV || "development";
const config = require("./config/config")[env];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    port: config.port,
    dialect: config.dialect,
    logging: false,
    dialectOptions: config.dialectOptions,
  }
);

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established.");
  } catch (err) {
    console.error("❌ Unable to connect:", err);
    process.exit(1);
  }
};

connectDB();
module.exports = { sequelize };