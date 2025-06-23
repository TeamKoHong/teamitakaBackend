#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 Simple Database Initialization Script');
console.log('Environment:', process.env.NODE_ENV || 'development');

const initDatabase = async () => {
  try {
    // 1. Sequelize 설정 로드
    console.log('🔧 Loading database configuration...');
    const { sequelize } = require('../src/config/db');
    
    // 2. DB 연결 확인
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 3. 환경별 처리
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      console.log('🏭 Production environment detected');
      console.log('⚠️  Running in production mode - only table creation');
      
      // 프로덕션: 테이블 생성만
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Production tables synchronized safely');
      
    } else {
      console.log('🛠️  Development/Test environment detected');
      console.log('🔄 Running simple initialization');
      
      // 개발/테스트: 간단한 동기화
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Development tables synchronized');
      
      // 4. 간단한 시드 데이터 생성
      await createSimpleSeedData(sequelize);
      console.log('✅ Simple seed data created');
    }

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  }
};

const createSimpleSeedData = async (sequelize) => {
  console.log('🌱 Creating simple seed data...');
  
  try {
    // 간단한 테스트 사용자 생성 (직접 SQL 사용)
    const testUserResult = await sequelize.query(`
      INSERT INTO Users (email, password, name, univName, certified_email, certified_date, createdAt, updatedAt)
      VALUES (
        'test@example.com',
        '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        '테스트 사용자',
        '테스트 대학교',
        'test@test.ac.kr',
        NOW(),
        NOW(),
        NOW()
      )
      ON DUPLICATE KEY UPDATE updatedAt = NOW()
    `);
    console.log('✅ Test user created/updated');

    // 사용자 ID 가져오기
    const [users] = await sequelize.query(`
      SELECT id FROM Users WHERE email = 'test@example.com' LIMIT 1
    `);
    
    if (users.length > 0) {
      const userId = users[0].id;
      
      // 간단한 테스트 모집공고 생성
      await sequelize.query(`
        INSERT INTO Recruitments (title, content, author_id, status, deadline, createdAt, updatedAt)
        VALUES (
          '테스트 모집공고',
          '이것은 테스트용 모집공고입니다.',
          ${userId},
          'active',
          DATE_ADD(NOW(), INTERVAL 30 DAY),
          NOW(),
          NOW()
        )
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `);
      console.log('✅ Test recruitment created/updated');

      // 간단한 테스트 프로젝트 생성
      await sequelize.query(`
        INSERT INTO Projects (title, description, status, startDate, endDate, createdAt, updatedAt)
        VALUES (
          '테스트 프로젝트',
          '이것은 테스트용 프로젝트입니다.',
          'active',
          NOW(),
          DATE_ADD(NOW(), INTERVAL 60 DAY),
          NOW(),
          NOW()
        )
        ON DUPLICATE KEY UPDATE updatedAt = NOW()
      `);
      console.log('✅ Test project created/updated');
    }

    console.log('🎉 Simple seed data created successfully!');
    
  } catch (error) {
    console.error('❌ Simple seed data creation failed:', error);
    console.log('⚠️  Continuing without seed data...');
  }
};

// 스크립트 실행
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase }; 