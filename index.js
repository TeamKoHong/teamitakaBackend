// index.js
const { loadEnvFile, validateRequiredEnvVars, printEnvStatus } = require('./src/config/envLoader');
const { sequelize } = require('./src/config/db');
const { initializeScheduledJobs, stopScheduledJobs } = require('./src/jobs');
const path = require('path');
const fs = require('fs');

// 환경 변수 로드
loadEnvFile();

// 필수 환경 변수 검증
validateRequiredEnvVars();

// 환경 변수 상태 출력 (개발 환경에서만)
printEnvStatus();

const app = require("./src/app");  // Express 앱

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

// 🔄 Production 환경에서 자동 migration 실행 (Programmatic)
async function runMigrations() {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('🔄 Running production migrations programmatically...');

      const migrationsPath = path.join(__dirname, 'src', 'migrations');
      const migrationFiles = fs.readdirSync(migrationsPath)
        .filter(file => file.endsWith('.js'))
        .sort(); // 파일명 순서대로 실행

      const queryInterface = sequelize.getQueryInterface();

      // SequelizeMeta 테이블 확인/생성 (migration 이력 추적)
      await queryInterface.createTable('SequelizeMeta', {
        name: {
          type: sequelize.Sequelize.STRING,
          allowNull: false,
          unique: true,
          primaryKey: true
        }
      }).catch(() => {}); // 이미 존재하면 무시

      for (const file of migrationFiles) {
        const migrationName = file;

        // 이미 실행된 migration인지 확인
        const [executed] = await queryInterface.sequelize.query(
          `SELECT name FROM "SequelizeMeta" WHERE name = '${migrationName}'`
        );

        if (executed.length > 0) {
          console.log(`⏭️  Skipping ${migrationName} (already executed)`);
          continue;
        }

        console.log(`🔧 Executing migration: ${migrationName}`);
        const migration = require(path.join(migrationsPath, file));

        // Migration 실행
        await migration.up(queryInterface, sequelize.Sequelize);

        // SequelizeMeta에 기록
        await queryInterface.sequelize.query(
          `INSERT INTO "SequelizeMeta" (name) VALUES ('${migrationName}')`
        );

        console.log(`✅ Migration ${migrationName} completed`);
      }

      console.log('✅ All migrations completed successfully');
    } catch (error) {
      console.error('❌ Migration execution failed:', error.message);
      console.error(error.stack);
      console.error('⚠️ Server will start anyway, but database schema may be outdated');
    }
  } else {
    console.log('ℹ️ Skipping auto-migration (not production environment)');
  }
}

// Migration 실행 후 서버 시작
runMigrations().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`🚀 Server listening on ${HOST}:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);

    // Initialize scheduled jobs after server starts
    initializeScheduledJobs();
    console.log('⏰ Scheduled jobs initialized');

    setInterval(() => console.log('✅ Server still running...'), 5000);
  });
}).catch(error => {
  console.error('💥 Critical error during startup:', error);
  process.exit(1);
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');

  try {
    // Stop scheduled jobs first
    stopScheduledJobs();
    console.log('⏰ Scheduled jobs stopped');

    // Close database connection
    await sequelize.close();
    console.log('🗄️  Database connection closed');

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');

  try {
    // Stop scheduled jobs first
    stopScheduledJobs();
    console.log('⏰ Scheduled jobs stopped');

    // Close database connection
    await sequelize.close();
    console.log('🗄️  Database connection closed');

    console.log('✅ Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during graceful shutdown:', error);
    process.exit(1);
  }
});
