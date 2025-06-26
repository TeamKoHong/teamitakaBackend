const { Sequelize } = require('sequelize');

(async () => {
  try {
    // 환경에 따라 적절한 환경변수 선택
    const env = process.env.NODE_ENV || 'development';
    const dbHost = env === 'production' ? process.env.GCP_DB_HOST : process.env.DB_HOST;
    const dbUser = env === 'production' ? process.env.GCP_DB_USER : process.env.DB_USER;
    const dbPassword = env === 'production' ? process.env.GCP_DB_PASSWORD : process.env.DB_PASSWORD;
    const dbName = env === 'production' ? process.env.GCP_DB_NAME : process.env.DB_NAME;
    const dbPort = process.env.DB_PORT || 3306;

    console.log('🔍 Environment variables:');
    console.log('NODE_ENV:', env);
    console.log('DB_HOST:', dbHost);
    console.log('DB_USER:', dbUser ? 'SET' : 'NOT SET');
    console.log('DB_PASSWORD:', dbPassword ? 'SET' : 'NOT SET');
    console.log('DB_NAME:', dbName);
    console.log('DB_PORT:', dbPort);

    // Sequelize 인스턴스 생성
    const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
      host: dbHost,
      port: dbPort,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: false,
        connectTimeout: 10000,
      },
    });

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