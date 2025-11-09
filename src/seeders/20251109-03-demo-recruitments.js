'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 프로젝트 조회
    const projects = await queryInterface.sequelize.query(
      `SELECT p.project_id, p.title, p.description, p.leader_id
       FROM projects p
       JOIN users u ON p.leader_id = u.user_id
       WHERE u.email LIKE 'testuser%'
       ORDER BY p.created_at`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (projects.length === 0) {
      console.log('⚠️ 테스트 프로젝트가 없습니다. projects seeder를 먼저 실행해주세요.');
      return;
    }

    const now = new Date();
    const recruitments = [];

    // 스킬 템플릿
    const skillsTemplates = [
      'React, Node.js, TypeScript',
      'Python, Django, PostgreSQL',
      'Vue.js, Express, MongoDB',
      'React Native, Firebase',
      'Java, Spring Boot, MySQL',
      'Flutter, Dart, REST API',
      'Angular, NestJS, GraphQL',
      'Swift, iOS Development',
      'Kotlin, Android Development',
      'Unity, C#, Game Development'
    ];

    // 각 프로젝트에 대해 모집글 생성 (70% ACTIVE, 20% CLOSED, 10% FILLED)
    projects.forEach((project, index) => {
      let status;
      const rand = index % 10;
      if (rand < 7) {
        status = 'ACTIVE';
      } else if (rand < 9) {
        status = 'CLOSED';
      } else {
        status = 'FILLED';
      }

      const deadline = new Date(now.getTime() + (30 + index * 5) * 24 * 60 * 60 * 1000); // 30-85일 후
      const skillsIndex = index % skillsTemplates.length;

      recruitments.push({
        recruitment_id: uuidv4(),
        project_id: project.project_id,
        title: `${project.title} 팀원 모집`,
        description: `${project.description}\n\n함께 프로젝트를 진행할 열정적인 팀원을 찾습니다!`,
        requirements: '성실하고 책임감 있는 분, 팀워크를 중시하는 분, 주 2회 이상 미팅 참여 가능한 분',
        skills_required: skillsTemplates[skillsIndex],
        deadline: deadline,
        max_members: 3 + (index % 5), // 3-7명
        status: status,
        created_at: now,
        updated_at: now
      });
    });

    await queryInterface.bulkInsert('recruitments', recruitments, {});

    console.log(`✅ ${recruitments.length}개의 모집글 생성 완료`);
    console.log(`📊 ACTIVE: ${recruitments.filter(r => r.status === 'ACTIVE').length}개, CLOSED: ${recruitments.filter(r => r.status === 'CLOSED').length}개, FILLED: ${recruitments.filter(r => r.status === 'FILLED').length}개`);
  },

  async down(queryInterface, Sequelize) {
    // 테스트 사용자의 프로젝트에 연결된 모집글만 삭제
    const projects = await queryInterface.sequelize.query(
      `SELECT p.project_id FROM projects p
       JOIN users u ON p.leader_id = u.user_id
       WHERE u.email LIKE 'testuser%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (projects.length > 0) {
      const projectIds = projects.map(p => p.project_id);
      await queryInterface.bulkDelete('recruitments', {
        project_id: {
          [Sequelize.Op.in]: projectIds
        }
      }, {});
    }

    console.log('🗑️ 테스트 모집글 데이터 삭제 완료');
  }
};
