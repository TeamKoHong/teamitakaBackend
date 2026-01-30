'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * 모집공고 UI 테스트 데이터
 *
 * 테스트 케이스:
 * 1. 활성 모집 (D-7): 테두리 없는 일반 카드
 * 2. 활성 모집 (D-14): 테두리 없는 일반 카드
 * 3. 만료된 모집 (D-DAY, 목표 달성): 오렌지 테두리 카드
 * 4. 모집 실패 (만료 + 목표 미달): 실패 섹션에 표시
 *
 * 분류 로직:
 * - active_projects: status == 'ACTIVE' && recruitment_end > NOW()
 * - expired_projects: recruitment_end <= NOW() && application_count >= max_applicants
 * - failed_projects: recruitment_end <= NOW() && application_count < max_applicants
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // sjwoo 사용자 조회
    const [users] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = 'sjwoo1999@korea.ac.kr' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다. sjwoo-test-data seeder를 먼저 실행해주세요.');
      return;
    }

    const userId = users.user_id;
    const now = new Date();

    // 테스트용 모집공고 ID 생성
    const recruitmentIds = {
      activeD7: uuidv4(),
      activeD14: uuidv4(),
      expiredDDay: uuidv4(),
      failed: uuidv4(),
    };

    // 날짜 헬퍼 함수
    const addDays = (date, days) => new Date(date.getTime() + days * 24 * 60 * 60 * 1000);

    const recruitments = [
      // Case 1: 활성 모집 프로젝트 (D-7)
      {
        recruitment_id: recruitmentIds.activeD7,
        user_id: userId,
        project_id: null,
        title: '교내 동아리 전시 프로젝트 팀원 구합니다',
        description: '교내 전시 프로젝트',  // 20자 제한
        status: 'ACTIVE',
        max_applicants: 5,
        views: 150,
        recruitment_start: now,
        recruitment_end: addDays(now, 7),
        project_type: 'side',
        photo_url: null,
        scrap_count: 3,
        created_at: now,
        updated_at: now,
      },
      // Case 2: 활성 모집 프로젝트 (D-14)
      {
        recruitment_id: recruitmentIds.activeD14,
        user_id: userId,
        project_id: null,
        title: '앱 개발 스터디 모집',
        description: 'Flutter 앱 스터디',  // 20자 제한
        status: 'ACTIVE',
        max_applicants: 6,
        views: 80,
        recruitment_start: now,
        recruitment_end: addDays(now, 14),
        project_type: 'side',
        photo_url: null,
        scrap_count: 1,
        created_at: now,
        updated_at: now,
      },
      // Case 3: 만료된 프로젝트 - 목표 달성 (D-DAY)
      {
        recruitment_id: recruitmentIds.expiredDDay,
        user_id: userId,
        project_id: null,
        title: '웹 개발 프로젝트 팀원 모집',
        description: '리액트 웹 서비스 개발',  // 20자 제한
        status: 'ACTIVE',  // 상태는 ACTIVE지만 기간 만료
        max_applicants: 4,
        views: 200,
        recruitment_start: addDays(now, -14),
        recruitment_end: addDays(now, -1),  // 어제 만료
        project_type: 'course',
        photo_url: null,
        scrap_count: 5,
        created_at: addDays(now, -14),
        updated_at: now,
      },
      // Case 4: 모집 실패 프로젝트 (만료 + 목표 미달)
      {
        recruitment_id: recruitmentIds.failed,
        user_id: userId,
        project_id: null,
        title: 'AI 챗봇 개발 프로젝트',
        description: 'OpenAI API 챗봇',  // 20자 제한
        status: 'ACTIVE',  // 상태는 ACTIVE지만 기간 만료
        max_applicants: 5,
        views: 100,
        recruitment_start: addDays(now, -30),
        recruitment_end: addDays(now, -3),  // 3일 전 만료
        project_type: 'side',
        photo_url: null,
        scrap_count: 2,
        created_at: addDays(now, -30),
        updated_at: now,
      },
    ];

    // 모집공고 삽입
    await queryInterface.bulkInsert('recruitments', recruitments, {});
    console.log(`✅ ${recruitments.length}개의 UI 테스트용 모집공고 생성 완료`);

    // 테스트 지원자 조회 (testuser1-10)
    const applicants = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email LIKE 'testuser%' ORDER BY email LIMIT 10`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (applicants.length === 0) {
      console.log('⚠️ 테스트 사용자가 없습니다. 지원자 데이터를 생성하지 않습니다.');
      return;
    }

    const introductions = [
      '안녕하세요! 열정적으로 참여하겠습니다.',
      '이 프로젝트에 관심이 많습니다. 함께 하고 싶어요!',
      '관련 경험이 있습니다. 잘 부탁드립니다.',
      '성실하게 참여하겠습니다!',
      '협업을 통해 성장하고 싶습니다.',
    ];

    const applications = [];

    // Case 1: 활성 D-7 - 2명 지원 (목표 5명)
    for (let i = 0; i < 2 && i < applicants.length; i++) {
      applications.push({
        application_id: uuidv4(),
        user_id: applicants[i].user_id,
        recruitment_id: recruitmentIds.activeD7,
        status: 'PENDING',
        introduction: introductions[i % introductions.length],
        created_at: addDays(now, -2),
        updated_at: addDays(now, -2),
      });
    }

    // Case 2: 활성 D-14 - 3명 지원 (목표 6명)
    for (let i = 0; i < 3 && i < applicants.length; i++) {
      applications.push({
        application_id: uuidv4(),
        user_id: applicants[i].user_id,
        recruitment_id: recruitmentIds.activeD14,
        status: 'PENDING',
        introduction: introductions[i % introductions.length],
        created_at: addDays(now, -1),
        updated_at: addDays(now, -1),
      });
    }

    // Case 3: 만료 D-DAY (목표 달성) - 4명 지원 (목표 4명)
    for (let i = 0; i < 4 && i < applicants.length; i++) {
      applications.push({
        application_id: uuidv4(),
        user_id: applicants[i].user_id,
        recruitment_id: recruitmentIds.expiredDDay,
        status: 'PENDING',
        introduction: introductions[i % introductions.length],
        created_at: addDays(now, -7),
        updated_at: addDays(now, -7),
      });
    }

    // Case 4: 모집 실패 - 2명 지원 (목표 5명, 미달)
    for (let i = 0; i < 2 && i < applicants.length; i++) {
      applications.push({
        application_id: uuidv4(),
        user_id: applicants[i].user_id,
        recruitment_id: recruitmentIds.failed,
        status: 'PENDING',
        introduction: introductions[i % introductions.length],
        created_at: addDays(now, -10),
        updated_at: addDays(now, -10),
      });
    }

    // 지원서 삽입
    await queryInterface.bulkInsert('applications', applications, {});
    console.log(`✅ ${applications.length}개의 UI 테스트용 지원서 생성 완료`);

    // 결과 요약
    console.log('\n📋 UI 테스트 데이터 요약:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ 케이스                  │ D-Day │ 지원/목표 │ 예상 UI        │');
    console.log('├─────────────────────────────────────────────────────────────┤');
    console.log('│ 1. 교내 전시 프로젝트   │ D-7   │ 2/5      │ 일반 카드      │');
    console.log('│ 2. 앱 개발 스터디       │ D-14  │ 3/6      │ 일반 카드      │');
    console.log('│ 3. 웹 개발 프로젝트     │ D-DAY │ 4/4      │ 오렌지 테두리  │');
    console.log('│ 4. AI 챗봇 프로젝트     │ 만료  │ 2/5      │ 실패 섹션      │');
    console.log('└─────────────────────────────────────────────────────────────┘');
  },

  async down(queryInterface, Sequelize) {
    // sjwoo 사용자 조회
    const [users] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = 'sjwoo1999@korea.ac.kr' LIMIT 1`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!users) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다.');
      return;
    }

    const userId = users.user_id;

    // UI 테스트용 모집공고 제목으로 식별하여 삭제
    const testTitles = [
      '교내 동아리 전시 프로젝트 팀원 구합니다',
      '앱 개발 스터디 모집',
      '웹 개발 프로젝트 팀원 모집',
      'AI 챗봇 개발 프로젝트',
    ];

    // 먼저 해당 모집공고의 지원서 삭제
    await queryInterface.sequelize.query(
      `DELETE FROM applications
       WHERE recruitment_id IN (
         SELECT recruitment_id FROM recruitments
         WHERE user_id = :userId AND title IN (:titles)
       )`,
      {
        replacements: { userId, titles: testTitles },
        type: Sequelize.QueryTypes.DELETE,
      }
    );

    // 모집공고 삭제
    await queryInterface.bulkDelete('recruitments', {
      user_id: userId,
      title: {
        [Sequelize.Op.in]: testTitles,
      },
    }, {});

    console.log('🗑️ UI 테스트용 모집공고 및 지원서 데이터 삭제 완료');
  },
};
