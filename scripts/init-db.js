#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 Database Initialization Script');
console.log('Environment:', process.env.NODE_ENV || 'development');

const initDatabase = async () => {
  try {
    // 1. Sequelize 설정 먼저 로드
    console.log('🔧 Loading database configuration...');
    const { sequelize } = require('../src/config/db');
    
    // 2. DB 연결 확인
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 3. 모델 로딩 (안전하게)
    console.log('📦 Loading models...');
    const models = require('../src/models');
    console.log('✅ Models loaded successfully');

    // 4. 환경별 처리
    const env = process.env.NODE_ENV || 'development';
    
    if (env === 'production') {
      console.log('🏭 Production environment detected');
      console.log('⚠️  Running in production mode - only table creation');
      
      // 프로덕션: 테이블 생성만 (force: false로 안전하게)
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Production tables synchronized safely');
      
    } else {
      console.log('🛠️  Development/Test environment detected');
      console.log('🔄 Running full initialization with seed data');
      
      // 개발/테스트: 외래키 제약조건을 고려한 안전한 초기화
      await safeDatabaseReset(sequelize);
      console.log('✅ Development tables created');
      
      // 5. 시드 데이터 생성
      await createSeedData(models);
      console.log('✅ Seed data created');
    }

    console.log('🎉 Database initialization completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    console.error('Error details:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  }
};

const safeDatabaseReset = async (sequelize) => {
  console.log('🔄 Safely resetting database...');
  
  try {
    // 1. 외래키 제약조건 비활성화
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    console.log('✅ Foreign key checks disabled');
    
    // 2. 기존 데이터만 삭제 (테이블은 유지)
    const tables = [
      'VoteResponses', 'VoteOptions', 'Votes', 'VerifiedEmails', 'Todos',
      'Searches', 'Scraps', 'Schedules', 'Reviews', 'ProjectPosts',
      'projectmembers', 'Applications', 'Comments', 'Recruitments', 'Projects', 'Users'
    ];
    
    for (const table of tables) {
      try {
        await sequelize.query(`DELETE FROM \`${table}\`;`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.log(`⚠️  Could not clear table ${table}: ${error.message}`);
      }
    }
    
    // 3. 외래키 제약조건 다시 활성화
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Foreign key checks re-enabled');
    
    // 4. 테이블 구조 동기화 (필요한 경우에만)
    await sequelize.sync({ force: false, alter: true });
    console.log('✅ Tables synchronized');
    
  } catch (error) {
    // 오류 발생 시 외래키 제약조건 복구
    try {
      await sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
    } catch (e) {
      console.warn('⚠️  Could not re-enable foreign key checks:', e.message);
    }
    throw error;
  }
};

const createSeedData = async (models) => {
  console.log('🌱 Creating seed data...');
  
  try {
    const { User, Project, Recruitment, Application, Comment, Review } = models;
    
    // 1. 테스트 사용자 생성
    const testUser = await User.create({
      email: 'test@example.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      name: '테스트 사용자',
      univName: '테스트 대학교',
      certified_email: 'test@test.ac.kr',
      certified_date: new Date()
    });
    console.log('✅ Test user created:', testUser.email);

    // 2. 테스트 모집공고 생성
    const testRecruitment = await Recruitment.create({
      title: '테스트 모집공고',
      content: '이것은 테스트용 모집공고입니다. API 테스트를 위해 생성되었습니다.',
      author_id: testUser.id,
      status: 'active',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30일 후
    });
    console.log('✅ Test recruitment created:', testRecruitment.title);

    // 3. 테스트 프로젝트 생성
    const testProject = await Project.create({
      title: '테스트 프로젝트',
      description: '이것은 테스트용 프로젝트입니다. API 테스트를 위해 생성되었습니다.',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60일 후
    });
    console.log('✅ Test project created:', testProject.title);

    // 4. 테스트 댓글 생성
    const testComment = await Comment.create({
      content: '이것은 테스트 댓글입니다.',
      recruitment_id: testRecruitment.id,
      user_id: testUser.id
    });
    console.log('✅ Test comment created');

    // 5. 테스트 지원 생성
    const testApplication = await Application.create({
      recruitment_id: testRecruitment.id,
      user_id: testUser.id,
      status: 'pending',
      message: '테스트 지원 메시지입니다.'
    });
    console.log('✅ Test application created');

    // 6. 테스트 리뷰 생성
    const testReview = await Review.create({
      reviewer_id: testUser.id,
      reviewee_id: testUser.id, // 자기 자신에 대한 리뷰 (테스트용)
      project_id: testProject.id,
      ability_rating: 4,
      effort_rating: 5,
      dedication_rating: 4,
      communication_rating: 5,
      reflection_rating: 4,
      comment: '테스트 리뷰입니다.'
    });
    console.log('✅ Test review created');

    console.log('🎉 All seed data created successfully!');
    
  } catch (error) {
    console.error('❌ Seed data creation failed:', error);
    throw error;
  }
};

// 스크립트 실행
if (require.main === module) {
  initDatabase();
}

module.exports = { initDatabase, createSeedData }; 