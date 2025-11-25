// verify-db.js - 모집글 DB 저장 검증 스크립트
// 실행: node verify-db.js

const { sequelize } = require('./src/models');
const { Recruitment, User, Hashtag } = require('./src/models');

async function verifyRecruitments() {
  try {
    console.log('🔍 DB 연결 확인 중...');
    console.log('📍 검증 환경:', process.env.NODE_ENV || 'development');
    console.log('🗄️  DB 호스트:', process.env.DB_HOST || 'localhost');
    console.log('');
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공!\n');

    // 최근 5개 모집글 조회
    console.log('📊 최근 생성된 모집글 5개:');
    console.log('=' .repeat(60));

    // Raw SQL query to avoid schema mismatch issues
    // Note: Local DB may have different schema, so we only query recruitments table
    const [recruitments] = await sequelize.query(`
      SELECT
        recruitment_id,
        title,
        description,
        status,
        user_id,
        views,
        createdAt as created_at,
        updatedAt as updated_at
      FROM recruitments
      ORDER BY createdAt DESC
      LIMIT 5
    `);

    if (recruitments.length === 0) {
      console.log('⚠️  DB에 모집글이 없습니다.');
      console.log('\n💡 프론트엔드에서 모집글을 먼저 생성해주세요!');
      await sequelize.close();
      process.exit(0);
    }

    recruitments.forEach((r, idx) => {
      console.log(`\n[${idx + 1}] 모집글 정보:`);
      console.log(`  📝 ID: ${r.recruitment_id}`);
      console.log(`  📌 제목: ${r.title}`);
      console.log(`  📄 설명: ${r.description.substring(0, 50)}${r.description.length > 50 ? '...' : ''}`);
      console.log(`  🎯 상태: ${r.status}`);
      console.log(`  👤 작성자 ID: ${r.user_id}`);
      console.log(`  📅 생성일: ${new Date(r.created_at).toLocaleString('ko-KR')}`);
      console.log(`  👁️  조회수: ${r.views || 0}`);
    });

    // 통계 정보 (Raw SQL로 변경)
    console.log('\n' + '='.repeat(60));
    console.log('📈 모집글 통계:');

    const [[totalResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments`);
    const [[activeResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'ACTIVE'`);
    const [[closedResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'CLOSED'`);
    const [[filledResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'FILLED'`);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().slice(0, 19).replace('T', ' ');
    const [[todayResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE createdAt >= '${todayStr}'`);

    console.log(`  전체 모집글: ${totalResult.count}개`);
    console.log(`  ├─ ACTIVE (활성): ${activeResult.count}개`);
    console.log(`  ├─ CLOSED (마감): ${closedResult.count}개`);
    console.log(`  └─ FILLED (충원완료): ${filledResult.count}개`);
    console.log(`  📅 오늘 생성: ${todayResult.count}개`);

    console.log('\n✅ 검증 완료!');
    console.log('=' .repeat(60));

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('\n상세 에러:');
    console.error(error);

    try {
      await sequelize.close();
    } catch (closeError) {
      // ignore
    }

    process.exit(1);
  }
}

// 실행
console.log('🚀 모집글 DB 검증 시작...\n');
verifyRecruitments();
