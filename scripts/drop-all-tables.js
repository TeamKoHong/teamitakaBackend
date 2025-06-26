const { sequelize } = require('../src/config/db');

(async () => {
  try {
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    const [tables] = await sequelize.query('SHOW TABLES');
    for (const row of tables) {
      const table = Object.values(row)[0];
      if (table) {
        console.log('Dropping table:', table);
        await sequelize.query('DROP TABLE IF EXISTS `' + table + '`');
      }
    }
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    await sequelize.close();
    console.log('✅ All tables dropped!');
  } catch (err) {
    console.error('❌ Failed to drop all tables:', err);
    process.exit(1);
  }
})(); 