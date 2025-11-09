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

    // OPEN 상태의 모집글 조회
    const recruitments = await queryInterface.sequelize.query(
      `SELECT r.recruitment_id, r.user_id, r.title
       FROM recruitments r
       WHERE r.user_id IN (SELECT user_id FROM users WHERE email LIKE 'testuser%')
       AND r.status = 'OPEN'
       ORDER BY r.createdAt`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (recruitments.length === 0) {
      console.log('⚠️ OPEN 상태의 테스트 모집글이 없습니다.');
      return;
    }

    const now = new Date();
    const applications = [];

    // 각 사용자가 다른 사용자의 모집글에 지원 (자신의 모집글 제외)
    users.forEach((user, userIndex) => {
      // 자신의 모집글 제외
      const otherRecruitments = recruitments.filter(r => r.user_id !== user.user_id);

      // 각 사용자당 3-5개의 지원서 작성
      const applicationCount = 3 + (userIndex % 3);
      const selectedRecruitments = otherRecruitments.slice(0, Math.min(applicationCount, otherRecruitments.length));

      selectedRecruitments.forEach((recruitment, appIndex) => {
        // 40% PENDING, 40% APPROVED, 20% REJECTED
        let status;
        const rand = (userIndex * 10 + appIndex) % 10;
        if (rand < 4) {
          status = 'PENDING';
        } else if (rand < 8) {
          status = 'APPROVED';
        } else {
          status = 'REJECTED';
        }

        applications.push({
          application_id: uuidv4(),
          recruitment_id: recruitment.recruitment_id,
          user_id: user.user_id,
          status: status,
          createdAt: new Date(now.getTime() - (appIndex + 1) * 24 * 60 * 60 * 1000), // 1-5일 전
          updatedAt: now
        });
      });
    });

    await queryInterface.bulkInsert('applications', applications, {});

    console.log(`✅ ${applications.length}개의 지원서 생성 완료`);
    console.log(`📊 PENDING: ${applications.filter(a => a.status === 'PENDING').length}개, APPROVED: ${applications.filter(a => a.status === 'APPROVED').length}개, REJECTED: ${applications.filter(a => a.status === 'REJECTED').length}개`);
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
