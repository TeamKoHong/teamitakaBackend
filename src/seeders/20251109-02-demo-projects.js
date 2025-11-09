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

    const now = new Date();
    const projects = [];

    // 프로젝트 템플릿
    const projectTemplates = [
      {
        title: 'AI 챗봇 서비스 개발',
        description: 'ChatGPT API를 활용한 맞춤형 AI 챗봇 플랫폼을 개발합니다. React와 Node.js를 사용하여 실시간 대화 시스템을 구축할 예정입니다.'
      },
      {
        title: '헬스케어 운동 추천 앱',
        description: '사용자의 건강 데이터를 분석하여 맞춤형 운동 루틴을 추천하는 모바일 앱입니다. React Native와 Python Flask를 활용합니다.'
      },
      {
        title: 'E-커머스 플랫폼 구축',
        description: '소상공인을 위한 간편한 온라인 쇼핑몰 플랫폼을 개발합니다. 결제 시스템과 재고 관리 기능을 포함합니다.'
      },
      {
        title: '실시간 협업 도구',
        description: 'Figma와 같은 실시간 협업 디자인 툴을 개발합니다. WebRTC와 Canvas API를 활용한 동시 편집 기능을 구현합니다.'
      },
      {
        title: '스마트 홈 IoT 플랫폼',
        description: '가전제품을 통합 제어하는 스마트 홈 시스템입니다. MQTT 프로토콜과 모바일 앱을 통해 원격 제어가 가능합니다.'
      },
      {
        title: '블록체인 기반 투표 시스템',
        description: '안전하고 투명한 전자 투표 시스템을 블록체인 기술로 구현합니다. 스마트 컨트랙트를 활용합니다.'
      },
      {
        title: '음악 스트리밍 서비스',
        description: '독립 아티스트를 위한 음악 스트리밍 플랫폼입니다. 실시간 스트리밍과 추천 알고리즘을 구현합니다.'
      },
      {
        title: '온라인 교육 플랫폼',
        description: '실시간 화상 강의와 퀴즈 기능을 갖춘 교육 플랫폼입니다. WebRTC와 AI 기반 학습 분석 기능을 제공합니다.'
      },
      {
        title: '여행 일정 관리 앱',
        description: '여행 계획을 체계적으로 관리하고 공유할 수 있는 모바일 앱입니다. 지도 API와 SNS 기능을 통합합니다.'
      },
      {
        title: '푸드테크 배달 최적화',
        description: 'AI 기반 배달 경로 최적화 시스템입니다. 실시간 위치 추적과 머신러닝을 활용합니다.'
      }
    ];

    // 프로젝트 상태 배열: ACTIVE, COMPLETED, CANCELLED
    const statuses = ['ACTIVE', 'COMPLETED', 'CANCELLED'];

    // 각 사용자당 3개의 프로젝트 생성
    users.forEach((user, userIndex) => {
      for (let i = 0; i < 3; i++) {
        const templateIndex = (userIndex * 3 + i) % projectTemplates.length;
        const template = projectTemplates[templateIndex];
        const statusIndex = (userIndex * 3 + i) % 3; // 0: ACTIVE, 1: COMPLETED, 2: CANCELLED

        projects.push({
          project_id: uuidv4(),
          leader_id: user.user_id,
          title: template.title,
          description: template.description,
          status: statuses[statusIndex],
          created_at: now,
          updated_at: now
        });
      }
    });

    await queryInterface.bulkInsert('projects', projects, {});

    console.log(`✅ ${projects.length}개의 프로젝트 생성 완료`);
    console.log(`📊 ACTIVE: ${projects.filter(p => p.status === 'ACTIVE').length}개, COMPLETED: ${projects.filter(p => p.status === 'COMPLETED').length}개, CANCELLED: ${projects.filter(p => p.status === 'CANCELLED').length}개`);
  },

  async down(queryInterface, Sequelize) {
    // 테스트 사용자의 프로젝트만 삭제
    const users = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email LIKE 'testuser%'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (users.length > 0) {
      const userIds = users.map(u => u.user_id);
      await queryInterface.bulkDelete('projects', {
        leader_id: {
          [Sequelize.Op.in]: userIds
        }
      }, {});
    }

    console.log('🗑️ 테스트 프로젝트 데이터 삭제 완료');
  }
};
