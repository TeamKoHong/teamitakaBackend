'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 각 사용자의 모집글 조회 (사용자당 3개씩)
    const recruitments = await queryInterface.sequelize.query(
      `SELECT recruitment_id, user_id, title FROM recruitments
       WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE 'testuser%')
       ORDER BY user_id, createdAt`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (recruitments.length === 0) {
      console.log('⚠️ 테스트 모집글이 없습니다. recruitments seeder를 먼저 실행해주세요.');
      return;
    }

    const now = new Date();
    const projects = [];

    // 프로젝트 상태 배열: 예정, 진행 중, 완료
    const statuses = ['예정', '진행 중', '완료'];

    // 각 모집글에 대해 프로젝트 생성 (1:1 관계)
    recruitments.forEach((recruitment, index) => {
      const statusIndex = index % 3; // 0: 예정, 1: 진행 중, 2: 완료
      const status = statuses[statusIndex];

      // 상태별로 다른 날짜 설정
      let start_date, end_date;
      const baseDate = new Date(now);

      if (status === '예정') {
        // 예정: 시작일이 미래
        start_date = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7일 후
        end_date = new Date(start_date.getTime() + 60 * 24 * 60 * 60 * 1000); // 시작일로부터 60일 후
      } else if (status === '진행 중') {
        // 진행 중: 이미 시작했고 종료일은 미래
        start_date = new Date(baseDate.getTime() - 14 * 24 * 60 * 60 * 1000); // 14일 전
        end_date = new Date(baseDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후
      } else {
        // 완료: 이미 종료
        start_date = new Date(baseDate.getTime() - 90 * 24 * 60 * 60 * 1000); // 90일 전
        end_date = new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000); // 10일 전
      }

      projects.push({
        project_id: uuidv4(),
        user_id: recruitment.user_id,
        recruitment_id: recruitment.recruitment_id,
        title: recruitment.title,
        description: `${recruitment.title} 프로젝트입니다. 팀원들과 협력하여 목표를 달성합니다.`,
        status: status,
        start_date: start_date,
        end_date: end_date,
        role: null,
        createdAt: now,
        updatedAt: now
      });
    });

    await queryInterface.bulkInsert('projects', projects, {});

    console.log(`✅ ${projects.length}개의 프로젝트 생성 완료`);
    console.log(`📊 예정: ${projects.filter(p => p.status === '예정').length}개, 진행 중: ${projects.filter(p => p.status === '진행 중').length}개, 완료: ${projects.filter(p => p.status === '완료').length}개`);
  },

  async down(queryInterface, Sequelize) {
    // 테스트 사용자의 모집글에 연결된 프로젝트만 삭제
    const recruitments = await queryInterface.sequelize.query(
      `SELECT recruitment_id FROM recruitments
       WHERE user_id IN (SELECT user_id FROM users WHERE email LIKE 'testuser%')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (recruitments.length > 0) {
      const recruitmentIds = recruitments.map(r => r.recruitment_id);
      await queryInterface.bulkDelete('projects', {
        recruitment_id: {
          [Sequelize.Op.in]: recruitmentIds
        }
      }, {});
    }

    console.log('🗑️ 테스트 프로젝트 데이터 삭제 완료');
  }
};
