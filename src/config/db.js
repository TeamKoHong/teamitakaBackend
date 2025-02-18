require("dotenv").config();
const { Sequelize } = require("sequelize");

let sequelize = null;

if (process.env.NODE_ENV !== "test") {
  sequelize = new Sequelize(
    process.env.DB_NAME || "test_db",
    process.env.DB_USER || "root",
    process.env.DB_PASSWORD || "",
    {
      host: process.env.DB_HOST || "127.0.0.1",
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
}

module.exports = { sequelize };
