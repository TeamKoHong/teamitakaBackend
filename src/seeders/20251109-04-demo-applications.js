'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 테스트 사용자 조회
    const users = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users WHERE email LIKE 'testuser%' ORDER BY email`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length === 0) {
      console.log('⚠️ 테스트 사용자가 없습니다. users seeder를 먼저 실행해주세요.');
      return;
    }

    // ACTIVE 상태의 모집글 조회
    const recruitments = await queryInterface.sequelize.query(
      `SELECT r.recruitment_id, r.project_id, r.title
       FROM recruitments r
       JOIN projects p ON r.project_id = p.project_id
       JOIN users u ON p.leader_id = u.user_id
       WHERE u.email LIKE 'testuser%'
       AND r.status = 'ACTIVE'
       ORDER BY r.created_at`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (recruitments.length === 0) {
      console.log('⚠️ ACTIVE 상태의 테스트 모집글이 없습니다.');
      return;
    }

    const now = new Date();
    const applications = [];

    // 지원 메시지 템플릿
    const messageTemplates = [
      '안녕하세요! 해당 프로젝트에 큰 관심이 있어 지원하게 되었습니다. 성실히 임하겠습니다.',
      '프로젝트 설명을 보고 꼭 참여하고 싶다는 생각이 들었습니다. 열심히 하겠습니다!',
      '비슷한 프로젝트 경험이 있어 도움이 될 수 있을 것 같습니다. 함께 하고 싶습니다.',
      '해당 분야에 관심이 많아 많이 배우고 싶습니다. 잘 부탁드립니다!',
      '팀워크를 중시하며 책임감 있게 프로젝트에 임하겠습니다.',
      '새로운 기술을 배우고 성장하고 싶어 지원합니다. 최선을 다하겠습니다!',
      '프로젝트 목표에 공감하며 함께 좋은 결과를 만들고 싶습니다.',
      '관련 경험을 바탕으로 프로젝트에 기여하고 싶습니다.'
    ];

    // 각 사용자가 다른 사용자의 모집글에 지원
    users.forEach((user, userIndex) => {
      // 각 사용자당 3-5개의 지원서 작성
      const applicationCount = 3 + (userIndex % 3);
      const selectedRecruitments = recruitments.slice(0, Math.min(applicationCount, recruitments.length));

      selectedRecruitments.forEach((recruitment, appIndex) => {
        // 40% PENDING, 40% ACCEPTED, 20% REJECTED
        let status;
        const rand = (userIndex * 10 + appIndex) % 10;
        if (rand < 4) {
          status = 'PENDING';
        } else if (rand < 8) {
          status = 'ACCEPTED';
        } else {
          status = 'REJECTED';
        }

        const messageIndex = (userIndex + appIndex) % messageTemplates.length;
        const appliedDate = new Date(now.getTime() - (appIndex + 1) * 24 * 60 * 60 * 1000); // 1-5일 전

        applications.push({
          application_id: uuidv4(),
          recruitment_id: recruitment.recruitment_id,
          user_id: user.user_id,
          message: messageTemplates[messageIndex],
          status: status,
          applied_at: appliedDate,
          created_at: appliedDate,
          updated_at: now
        });
      });
    });

    await queryInterface.bulkInsert('applications', applications, {});

    console.log(`✅ ${applications.length}개의 지원서 생성 완료`);
    console.log(`📊 PENDING: ${applications.filter(a => a.status === 'PENDING').length}개, ACCEPTED: ${applications.filter(a => a.status === 'ACCEPTED').length}개, REJECTED: ${applications.filter(a => a.status === 'REJECTED').length}개`);
  },

  async down(queryInterface, Sequelize) {
    // 테스트 사용자의 지원서만 삭제
    const users = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email LIKE 'testuser%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      const userIds = users.map(u => u.user_id);
      await queryInterface.bulkDelete('applications', {
        user_id: {
          [Sequelize.Op.in]: userIds
        }
      }, {});
    }

    console.log('🗑️ 테스트 지원서 데이터 삭제 완료');
  }
};
