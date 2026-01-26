'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');

/**
 * 학교별 필터링 테스트 데이터
 * - 6개 학교 (고려대, 연세대, 서울대, KAIST, 홍익대, 중부대) + NULL
 * - 12명 사용자
 * - 15개 모집글
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const passwordHash = await bcrypt.hash('Test1234!', 10);

    // 학교별 테스트 사용자 (UUID 미리 생성하여 모집글에서 참조)
    const testUsers = [
      { id: uuidv4(), username: 'school_test_korea1', email: 'school_korea1@test.com', university: '고려대학교' },
      { id: uuidv4(), username: 'school_test_korea2', email: 'school_korea2@test.com', university: '고려대학교' },
      { id: uuidv4(), username: 'school_test_yonsei1', email: 'school_yonsei1@test.com', university: '연세대학교' },
      { id: uuidv4(), username: 'school_test_yonsei2', email: 'school_yonsei2@test.com', university: '연세대학교' },
      { id: uuidv4(), username: 'school_test_snu1', email: 'school_snu1@test.com', university: '서울대학교' },
      { id: uuidv4(), username: 'school_test_snu2', email: 'school_snu2@test.com', university: '서울대학교' },
      { id: uuidv4(), username: 'school_test_null', email: 'school_null@test.com', university: null },
      { id: uuidv4(), username: 'school_test_kaist', email: 'school_kaist@test.com', university: 'KAIST' },
      { id: uuidv4(), username: 'school_test_hongik1', email: 'school_hongik1@test.com', university: '홍익대학교' },
      { id: uuidv4(), username: 'school_test_hongik2', email: 'school_hongik2@test.com', university: '홍익대학교' },
      { id: uuidv4(), username: 'school_test_jungbu1', email: 'school_jungbu1@test.com', university: '중부대학교' },
      { id: uuidv4(), username: 'school_test_jungbu2', email: 'school_jungbu2@test.com', university: '중부대학교' },
    ];

    // 사용자 삽입
    await queryInterface.bulkInsert('users', testUsers.map(u => ({
      user_id: u.id,
      username: u.username,
      email: u.email,
      password: passwordHash,
      university: u.university,
      email_verified_at: now,
      created_at: now,
      updated_at: now
    })));

    // 모집글 데이터 (user_id 직접 참조, description은 20자 제한)
    const recruitments = [
      // 고려대학교 (3개)
      { user_id: testUsers[0].id, title: '[고려대] AI 스터디 팀원 모집', desc: 'AI 스터디 팀원 모집' },
      { user_id: testUsers[0].id, title: '[고려대] 웹 개발 프로젝트', desc: '웹 개발 프로젝트' },
      { user_id: testUsers[1].id, title: '[고려대] 창업 동아리 멤버', desc: '창업 동아리 멤버' },
      // 연세대학교 (3개)
      { user_id: testUsers[2].id, title: '[연세대] 앱 개발 팀원 모집', desc: '앱 개발 팀원 모집' },
      { user_id: testUsers[2].id, title: '[연세대] 데이터 분석 스터디', desc: '데이터 분석 스터디' },
      { user_id: testUsers[3].id, title: '[연세대] UX/UI 프로젝트', desc: 'UX/UI 프로젝트' },
      // 서울대학교 (3개)
      { user_id: testUsers[4].id, title: '[서울대] 알고리즘 스터디', desc: '알고리즘 스터디' },
      { user_id: testUsers[4].id, title: '[서울대] 머신러닝 프로젝트', desc: '머신러닝 프로젝트' },
      { user_id: testUsers[5].id, title: '[서울대] 오픈소스 컨트리뷰션', desc: '오픈소스 컨트리뷰션' },
      // 학교 미설정 (1개)
      { user_id: testUsers[6].id, title: '[학교미설정] 누구나 참여 가능', desc: '누구나 참여 가능' },
      // KAIST (1개)
      { user_id: testUsers[7].id, title: '[KAIST] 로봇 공학 프로젝트', desc: '로봇 공학 프로젝트' },
      // 홍익대학교 (2개)
      { user_id: testUsers[8].id, title: '[홍익대] 디자인 포트폴리오 팀', desc: '디자인 포트폴리오' },
      { user_id: testUsers[9].id, title: '[홍익대] 미술 전시 프로젝트', desc: '미술 전시 프로젝트' },
      // 중부대학교 (2개)
      { user_id: testUsers[10].id, title: '[중부대] 게임 개발 스터디', desc: '게임 개발 스터디' },
      { user_id: testUsers[11].id, title: '[중부대] 영상 제작 프로젝트', desc: '영상 제작 프로젝트' },
    ];

    await queryInterface.bulkInsert('recruitments', recruitments.map((r, i) => ({
      recruitment_id: uuidv4(),
      user_id: r.user_id,
      title: r.title,
      description: r.desc, // 20자 제한
      status: 'ACTIVE',
      project_type: 'course',
      views: Math.floor(Math.random() * 100),
      scrap_count: 0,
      created_at: new Date(now.getTime() + i * 60000), // 1분 간격으로 생성
      updated_at: now
    })));

    console.log('✅ 학교별 필터링 테스트 데이터 생성 완료');
    console.log(`   - 사용자: ${testUsers.length}명`);
    console.log(`   - 모집글: ${recruitments.length}개`);
    console.log('   - 학교: 고려대(3), 연세대(3), 서울대(3), KAIST(1), 홍익대(2), 중부대(2), NULL(1)');
  },

  async down(queryInterface, Sequelize) {
    const { Op } = Sequelize;

    // 테스트 모집글 삭제 (제목 패턴으로 식별)
    await queryInterface.bulkDelete('recruitments', {
      title: { [Op.like]: '[%]%' }
    });

    // 테스트 사용자 삭제 (이메일 패턴으로 식별)
    await queryInterface.bulkDelete('users', {
      email: { [Op.like]: 'school_%@test.com' }
    });

    console.log('✅ 학교별 필터링 테스트 데이터 삭제 완료');
  }
};
