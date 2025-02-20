const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "mysql",
  logging: false,
});

async function checkUsersTable() {
  try {
    const [results] = await sequelize.query("SHOW TABLES LIKE 'Users'");
    if (results.length === 0) {
      console.error("❌ Users 테이블이 존재하지 않습니다. 마이그레이션이 실패할 수 있습니다.");
      process.exit(1);
    } else {
      console.log("✅ Users 테이블이 정상적으로 존재합니다.");
    }
  } catch (error) {
    console.error("❌ 데이터베이스 확인 중 오류 발생:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

checkUsersTable();
