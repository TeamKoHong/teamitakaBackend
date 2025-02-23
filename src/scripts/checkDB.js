const { sequelize } = require("../config/db"); // db.js에서 가져옴

async function checkUsersTable() {
  try {
    await sequelize.authenticate();
    console.log("✅ Successfully connected to the database");
    const tables = await sequelize.query("SHOW TABLES", { type: sequelize.QueryTypes.SELECT });
    console.log("Tables:", tables);
  } catch (err) {
    console.error("❌ Error checking Users table:", err);
    process.exit(1);
  }
}

checkUsersTable();