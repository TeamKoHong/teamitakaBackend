// verify-local-db.js - 로컬 DB 전용 간단 검증 스크립트
// 실행: node verify-local-db.js
// 용도: 로컬 개발 환경(localhost MySQL)에서만 사용

const { sequelize } = require('./src/models');
const { Recruitment } = require('./src/models');

async function verifyLocalDB() {
  try {
    console.log('🔍 로컬 DB 연결 확인 중...');
    console.log('📍 환경: 로컬 개발 환경');
    console.log('🗄️  DB: localhost MySQL\n');

    await sequelize.authenticate();
    console.log('✅ 로컬 DB 연결 성공!\n');

    // 간단한 조회 (JOIN 없음)
    console.log('📊 최근 생성된 모집글 5개 (간단 정보):');
    console.log('=' .repeat(60));

    // Raw SQL query to avoid schema mismatch issues
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
      console.log('⚠️  로컬 DB에 모집글이 없습니다.');
      console.log('\n💡 프론트엔드를 로컬로 실행해서 모집글을 생성해보세요!');
      console.log('   또는 production DB를 확인하려면 verify-db.js를 사용하세요.');
      await sequelize.close();
      process.exit(0);
    }

    recruitments.forEach((r, idx) => {
      console.log(`\n[${idx + 1}] 모집글:`);
      console.log(`  📝 ID: ${r.recruitment_id}`);
      console.log(`  📌 제목: ${r.title}`);
      console.log(`  🎯 상태: ${r.status}`);
      console.log(`  👤 작성자 ID: ${r.user_id}`);
      console.log(`  📅 생성일: ${new Date(r.created_at).toLocaleString('ko-KR')}`);
      console.log(`  👁️  조회수: ${r.views || 0}`);
    });

    // 통계 정보 (Raw SQL로 변경)
    console.log('\n' + '='.repeat(60));
    console.log('📈 로컬 DB 모집글 통계:');

    const [[totalResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments`);
    const [[activeResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'ACTIVE'`);
    const [[closedResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'CLOSED'`);
    const [[filledResult]] = await sequelize.query(`SELECT COUNT(*) as count FROM recruitments WHERE status = 'FILLED'`);

    console.log(`  전체 모집글: ${totalResult.count}개`);
    console.log(`  ├─ ACTIVE (활성): ${activeResult.count}개`);
    console.log(`  ├─ CLOSED (마감): ${closedResult.count}개`);
    console.log(`  └─ FILLED (충원완료): ${filledResult.count}개`);

    console.log('\n✅ 로컬 DB 검증 완료!');
    console.log('=' .repeat(60));
    console.log('\n💡 Production DB 확인: node verify-db.js');

    await sequelize.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ 오류 발생:', error.message);
    console.error('\n상세 에러:');
    console.error(error);
    console.error('\n💡 확인 사항:');
    console.error('  1. 로컬 MySQL이 실행 중인가요?');
    console.error('  2. .env 파일에 DATABASE_URL이 localhost를 가리키나요?');
    console.error('  3. DB 스키마가 최신인가요? (migrations 실행)');

    try {
      await sequelize.close();
    } catch (closeError) {
      // ignore
    }

    process.exit(1);
  }
}

// 실행
console.log('🚀 로컬 DB 검증 시작...\n');
verifyLocalDB();
