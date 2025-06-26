#!/usr/bin/env node

require('dotenv').config();

console.log('🚀 Database Initialization Script');
console.log('Environment:', process.env.NODE_ENV || 'development');

const initDatabase = async () => {
  try {
    // 1. 환경에 따라 적절한 환경변수 선택
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

    // 2. Sequelize 인스턴스 직접 생성
    const { Sequelize } = require('sequelize');
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
    
    // 3. DB 연결 확인
    console.log('🔗 Connecting to database...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');

    // 4. 모델 로딩 (안전하게)
    console.log('📦 Loading models...');
    
    // 기존 Sequelize 인스턴스를 사용하여 모델 로드
    const models = {};
    models.User = require('../src/models/User')(sequelize, sequelize.Sequelize.DataTypes);
    models.Project = require('../src/models/Project')(sequelize, sequelize.Sequelize.DataTypes);
    models.Recruitment = require('../src/models/Recruitment')(sequelize, sequelize.Sequelize.DataTypes);
    models.Application = require('../src/models/Application')(sequelize, sequelize.Sequelize.DataTypes);
    models.Comment = require('../src/models/Comment')(sequelize, sequelize.Sequelize.DataTypes);
    models.Review = require('../src/models/Review')(sequelize, sequelize.Sequelize.DataTypes);
    models.ProjectMembers = require('../src/models/ProjectMembers')(sequelize, sequelize.Sequelize.DataTypes);
    models.Todo = require('../src/models/Todo')(sequelize, sequelize.Sequelize.DataTypes);
    
    console.log('✅ Models loaded successfully');

    // 5. 환경별 처리
    if (env === 'production') {
      console.log('🏭 Production environment detected');
      console.log('🔄 Running production initialization with seed data');
      
      // 프로덕션: 테이블 생성 + 시드 데이터 삽입
      await sequelize.sync({ force: false, alter: true });
      console.log('✅ Production tables synchronized safely');
      
      // 시드 데이터 생성 (테스트용)
      await createSeedData(models);
      console.log('✅ Production seed data created');
      
    } else {
      console.log('🛠️  Development/Test environment detected');
      console.log('🔄 Running full initialization with seed data');
      
      // 개발/테스트: 외래키 제약조건을 고려한 안전한 초기화
      await safeDatabaseReset(sequelize);
      console.log('✅ Development tables created');
      
      // 6. 시드 데이터 생성
      await createSeedData(models);
      console.log('✅ Seed data created');
    }

    await sequelize.close();
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
      'ProjectMembers', 'Applications', 'Comments', 'Recruitments', 'Projects', 'Users'
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
    const { User, Project, Recruitment, Application, Comment, Review, Todo } = models;
    
    // 1. 테스트 사용자 생성 (간단한 ID 사용)
    const testUser = await User.create({
      user_id: '00000000-0000-0000-0000-000000000001', // 간단한 테스트용 ID
      username: 'testuser',
      email: 'test@example.com',
      password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // 'password'
      userType: 'MEMBER',
      role: 'MEMBER',
      university: '테스트 대학교',
      major: '컴퓨터공학과',
      bio: '테스트용 사용자입니다.',
      skills: 'JavaScript, Python, React',
      portfolio_url: 'https://github.com/testuser'
    });
    console.log('✅ Test user created:', testUser.email);

    // 2. 테스트 모집공고 생성
    const testRecruitment = await Recruitment.create({
      recruitment_id: '00000000-0000-0000-0000-000000000002', // 간단한 테스트용 ID
      title: '테스트 모집공고',
      description: '이것은 테스트용 모집공고입니다. API 테스트를 위해 생성되었습니다.',
      user_id: testUser.user_id,
      status: 'OPEN',
      views: 0
    });
    console.log('✅ Test recruitment created:', testRecruitment.title);

    // 3. 테스트 프로젝트 생성
    const testProject = await Project.create({
      project_id: '00000000-0000-0000-0000-000000000003', // 간단한 테스트용 ID
      title: '테스트 프로젝트',
      description: '이것은 테스트용 프로젝트입니다. API 테스트를 위해 생성되었습니다.',
      user_id: testUser.user_id,
      recruitment_id: testRecruitment.recruitment_id,
      status: '예정',
      start_date: new Date(),
      end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60일 후
    });
    console.log('✅ Test project created:', testProject.title);

    // 4. 테스트 댓글 생성
    const testComment = await Comment.create({
      id: '00000000-0000-0000-0000-000000000004', // 간단한 테스트용 ID
      content: '이것은 테스트 댓글입니다.',
      recruitment_id: testRecruitment.recruitment_id,
      user_id: testUser.user_id
    });
    console.log('✅ Test comment created');

    // 5. 테스트 지원 생성
    const testApplication = await Application.create({
      application_id: '00000000-0000-0000-0000-000000000005', // 간단한 테스트용 ID
      user_id: testUser.user_id,
      recruitment_id: testRecruitment.recruitment_id,
      status: 'PENDING'
    });
    console.log('✅ Test application created');

    // 6. 테스트 리뷰 생성
    const testReview = await Review.create({
      review_id: '00000000-0000-0000-0000-000000000006', // 간단한 테스트용 ID
      project_id: testProject.project_id,
      reviewer_id: testUser.user_id,
      reviewee_id: testUser.user_id, // 자기 자신에 대한 리뷰 (테스트용)
      ability: 4,
      effort: 5,
      commitment: 4,
      communication: 5,
      reflection: 4,
      overall_rating: 4,
      comment: '테스트 리뷰입니다.'
    });
    console.log('✅ Test review created');

    // 7. 테스트 할 일 생성
    const testTodo = await Todo.create({
      todo_id: '00000000-0000-0000-0000-000000000007', // 간단한 테스트용 ID
      project_id: testProject.project_id,
      content: '테스트 할 일입니다.',
      is_completed: false
    });
    console.log('✅ Test todo created');

    console.log('🎉 All seed data created successfully!');
    console.log('📋 Test IDs for API testing:');
    console.log('   - User ID: 00000000-0000-0000-0000-000000000001');
    console.log('   - Recruitment ID: 00000000-0000-0000-0000-000000000002');
    console.log('   - Project ID: 00000000-0000-0000-0000-000000000003');
    console.log('   - Comment ID: 00000000-0000-0000-0000-000000000004');
    console.log('   - Application ID: 00000000-0000-0000-0000-000000000005');
    console.log('   - Review ID: 00000000-0000-0000-0000-000000000006');
    console.log('   - Todo ID: 00000000-0000-0000-0000-000000000007');
    
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