'use strict';

const { v4: uuidv4 } = require('uuid');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // sjwoo1999@korea.ac.kr 사용자 조회
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!sjwooUser) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다.');
      return;
    }

    console.log(`✅ sjwoo1999@korea.ac.kr 사용자 확인: ${sjwooUser.username}`);

    const now = new Date();

    // 1. 프로젝트 생성 (ACTIVE 2개, COMPLETED 1개, CANCELLED 1개)
    const projects = [
      {
        project_id: uuidv4(),
        leader_id: sjwooUser.user_id,
        title: 'AI 기반 학습 관리 플랫폼',
        description: '학생들의 학습 패턴을 분석하여 맞춤형 학습 계획을 추천하는 AI 플랫폼입니다. React와 Python Flask를 사용하여 개발 중입니다.',
        status: 'ACTIVE',
        created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000), // 15일 전 생성
        updated_at: now
      },
      {
        project_id: uuidv4(),
        leader_id: sjwooUser.user_id,
        title: '대학생 커뮤니티 앱',
        description: '대학생들이 학과별, 관심사별로 모여 정보를 공유하고 스터디를 구성할 수 있는 모바일 앱입니다. React Native로 개발 중입니다.',
        status: 'ACTIVE',
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10일 전 생성
        updated_at: now
      },
      {
        project_id: uuidv4(),
        leader_id: sjwooUser.user_id,
        title: '스마트 캠퍼스 IoT 시스템',
        description: '캠퍼스 내 IoT 센서를 활용하여 강의실 사용 현황, 온도, 조명을 자동으로 관리하는 시스템입니다. 성공적으로 완료되었습니다.',
        status: 'COMPLETED',
        created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60일 전 생성
        updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000) // 5일 전 완료
      },
      {
        project_id: uuidv4(),
        leader_id: sjwooUser.user_id,
        title: '블록체인 기반 학점 관리 시스템',
        description: '블록체인 기술을 활용한 학점 관리 시스템 개발 프로젝트입니다. 기술적 어려움으로 인해 중단되었습니다.',
        status: 'CANCELLED',
        created_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90일 전 생성
        updated_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30일 전 취소
      }
    ];

    await queryInterface.bulkInsert('projects', projects, {});
    console.log(`✅ ${projects.length}개의 프로젝트 생성 완료`);

    // 2. ACTIVE 프로젝트에 대한 모집글 생성
    const activeProjects = projects.filter(p => p.status === 'ACTIVE');
    const recruitments = [
      {
        recruitment_id: uuidv4(),
        project_id: activeProjects[0].project_id,
        title: `${activeProjects[0].title} - 프론트엔드 개발자 모집`,
        description: `${activeProjects[0].description}\n\nReact와 TypeScript 경험이 있는 프론트엔드 개발자를 찾습니다!`,
        requirements: 'React 경험 6개월 이상, TypeScript 사용 가능, 주 3회 이상 미팅 참여 가능',
        skills_required: 'React, TypeScript, Redux, REST API',
        deadline: new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000), // 20일 후
        max_members: 3,
        status: 'ACTIVE',
        created_at: activeProjects[0].created_at,
        updated_at: now
      },
      {
        recruitment_id: uuidv4(),
        project_id: activeProjects[1].project_id,
        title: `${activeProjects[1].title} - 디자이너 및 개발자 모집`,
        description: `${activeProjects[1].description}\n\nUI/UX 디자이너와 React Native 개발자를 모집합니다.`,
        requirements: 'UI/UX 디자인 포트폴리오 필수, React Native 개발 경험 우대, 협업 능력 중요',
        skills_required: 'Figma, React Native, Mobile Design',
        deadline: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000), // 15일 후
        max_members: 4,
        status: 'ACTIVE',
        created_at: activeProjects[1].created_at,
        updated_at: now
      }
    ];

    await queryInterface.bulkInsert('recruitments', recruitments, {});
    console.log(`✅ ${recruitments.length}개의 모집글 생성 완료`);

    // 3. 테스트 사용자들이 sjwoo의 모집글에 지원
    const testUsers = await queryInterface.sequelize.query(
      `SELECT user_id, username FROM users WHERE email LIKE 'testuser%' ORDER BY email LIMIT 6`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (testUsers.length === 0) {
      console.log('⚠️ 테스트 사용자가 없어 지원서를 생성하지 못했습니다.');
      return;
    }

    const applications = [];
    const messageTemplates = [
      '안녕하세요! 해당 프로젝트에 큰 관심이 있어 지원하게 되었습니다. 관련 경험이 있어 도움이 될 수 있을 것 같습니다.',
      '프로젝트 목표에 공감하며 함께 좋은 결과를 만들고 싶습니다. 열심히 하겠습니다!',
      '비슷한 프로젝트 경험이 있어 기여할 수 있을 것 같습니다. 잘 부탁드립니다.',
      '해당 분야에 관심이 많고 배우고 싶어 지원합니다. 성실히 임하겠습니다!',
      '팀워크를 중시하며 책임감 있게 프로젝트에 참여하고 싶습니다.',
      '새로운 기술을 배우며 성장하고 싶어 지원합니다. 최선을 다하겠습니다!'
    ];

    // 첫 번째 모집글에 4명 지원
    for (let i = 0; i < 4 && i < testUsers.length; i++) {
      const status = i === 0 ? 'APPROVED' : i === 1 ? 'PENDING' : i === 2 ? 'REJECTED' : 'PENDING';
      const appliedDate = new Date(now.getTime() - (i + 1) * 2 * 24 * 60 * 60 * 1000); // 2, 4, 6, 8일 전

      applications.push({
        application_id: uuidv4(),
        recruitment_id: recruitments[0].recruitment_id,
        user_id: testUsers[i].user_id,
        message: messageTemplates[i],
        status: status,
        applied_at: appliedDate,
        created_at: appliedDate,
        updated_at: now
      });
    }

    // 두 번째 모집글에 2명 지원
    for (let i = 4; i < 6 && i < testUsers.length; i++) {
      const status = i === 4 ? 'PENDING' : 'PENDING';
      const appliedDate = new Date(now.getTime() - (i - 3) * 2 * 24 * 60 * 60 * 1000); // 2, 4일 전

      applications.push({
        application_id: uuidv4(),
        recruitment_id: recruitments[1].recruitment_id,
        user_id: testUsers[i].user_id,
        message: messageTemplates[i],
        status: status,
        applied_at: appliedDate,
        created_at: appliedDate,
        updated_at: now
      });
    }

    await queryInterface.bulkInsert('applications', applications, {});
    console.log(`✅ ${applications.length}개의 지원서 생성 완료`);
    console.log(`📊 APPROVED: ${applications.filter(a => a.status === 'APPROVED').length}개, PENDING: ${applications.filter(a => a.status === 'PENDING').length}개, REJECTED: ${applications.filter(a => a.status === 'REJECTED').length}개`);
  },

  async down(queryInterface, Sequelize) {
    // sjwoo1999@korea.ac.kr 사용자 조회
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (sjwooUser) {
      // 프로젝트 ID 조회
      const projects = await queryInterface.sequelize.query(
        `SELECT project_id FROM projects WHERE leader_id = '${sjwooUser.user_id}'`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (projects.length > 0) {
        const projectIds = projects.map(p => p.project_id);

        // 모집글 ID 조회
        const recruitments = await queryInterface.sequelize.query(
          `SELECT recruitment_id FROM recruitments WHERE project_id IN ('${projectIds.join("','")}')`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        if (recruitments.length > 0) {
          const recruitmentIds = recruitments.map(r => r.recruitment_id);

          // 지원서 삭제
          await queryInterface.bulkDelete('applications', {
            recruitment_id: {
              [Sequelize.Op.in]: recruitmentIds
            }
          }, {});
        }

        // 모집글 삭제
        await queryInterface.bulkDelete('recruitments', {
          project_id: {
            [Sequelize.Op.in]: projectIds
          }
        }, {});

        // 프로젝트 삭제
        await queryInterface.bulkDelete('projects', {
          leader_id: sjwooUser.user_id
        }, {});
      }

      console.log('🗑️ sjwoo1999@korea.ac.kr 테스트 데이터 삭제 완료');
    }
  }
};
