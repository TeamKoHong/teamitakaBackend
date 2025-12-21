'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * E2E 테스트용 상호평가 시드 데이터
 *
 * 목적: 프론트엔드 M07 상호평가 모듈 E2E 테스트 지원
 * 대상 사용자: sjwoo1999@korea.ac.kr
 *
 * 생성되는 데이터:
 * 1. COMPLETED 프로젝트 1개 (E2E 평가 테스트용)
 * 2. project_members 4명 (sjwoo + testuser1~3)
 * 3. 다양한 상태의 Reviews (완료/미완료 혼합)
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('\n🎯 E2E 평가 테스트 데이터 시딩 시작...\n');

    // 1. sjwoo1999@korea.ac.kr 사용자 확인
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!sjwooUser) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다. 시딩 중단.');
      return;
    }
    console.log(`✅ 테스트 사용자 확인: ${sjwooUser.username} (${sjwooUser.email})`);

    // 2. testuser1~3 사용자 조회
    const testUsers = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users
       WHERE email LIKE 'testuser%'
       ORDER BY email
       LIMIT 3`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (testUsers.length < 3) {
      console.log(`⚠️ 테스트 사용자가 부족합니다. 필요: 3명, 발견: ${testUsers.length}명`);
      console.log('💡 먼저 npm run seed:dev 로 기본 테스트 사용자를 생성해주세요.');
      return;
    }

    console.log(`✅ 테스트 팀원 확인: ${testUsers.map(u => u.username).join(', ')}`);

    const now = new Date();
    const projectId = uuidv4();

    // 3. E2E 테스트용 COMPLETED 프로젝트 생성
    const project = {
      project_id: projectId,
      leader_id: sjwooUser.user_id,
      title: 'E2E 평가 테스트 프로젝트',
      description: '프론트엔드 E2E 테스트(M07 상호평가 모듈)를 위한 테스트 프로젝트입니다. 이 프로젝트는 자동 생성되었으며, 상호평가 기능 테스트에 사용됩니다.',
      status: 'COMPLETED',
      start_date: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60일 전
      end_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5일 전
      created_at: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      updated_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)
    };

    // 기존 E2E 테스트 프로젝트가 있으면 스킵
    const [existingProject] = await queryInterface.sequelize.query(
      `SELECT project_id FROM projects WHERE title = 'E2E 평가 테스트 프로젝트' AND leader_id = :leaderId`,
      {
        replacements: { leaderId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (existingProject) {
      console.log('⏭️ E2E 테스트 프로젝트가 이미 존재합니다. 기존 데이터 사용.');
      // 기존 프로젝트 ID 사용
      project.project_id = existingProject.project_id;
    } else {
      await queryInterface.bulkInsert('projects', [project], {});
      console.log(`✅ E2E 테스트 프로젝트 생성: ${project.title}`);
    }

    // 4. project_members 추가 (4명: sjwoo + testuser1~3)
    const memberRoles = [
      { user_id: sjwooUser.user_id, role: 'LEADER' },
      { user_id: testUsers[0].user_id, role: '프론트엔드 개발자' },
      { user_id: testUsers[1].user_id, role: '백엔드 개발자' },
      { user_id: testUsers[2].user_id, role: 'UI/UX 디자이너' }
    ];

    const projectMembers = [];
    for (const member of memberRoles) {
      // 이미 멤버로 등록되어 있는지 확인
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM project_members WHERE project_id = :projectId AND user_id = :userId`,
        {
          replacements: { projectId: project.project_id, userId: member.user_id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!existing) {
        projectMembers.push({
          id: uuidv4(),
          project_id: project.project_id,
          user_id: member.user_id,
          role: member.role,
          joined_at: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000), // 프로젝트 시작 5일 후
          created_at: now,
          updated_at: now
        });
      }
    }

    if (projectMembers.length > 0) {
      await queryInterface.bulkInsert('project_members', projectMembers, {});
      console.log(`✅ 프로젝트 멤버 ${projectMembers.length}명 추가`);
    } else {
      console.log('⏭️ 모든 멤버가 이미 등록되어 있습니다.');
    }

    // 5. Reviews 생성 (다양한 상태)
    /*
     * 테스트 시나리오:
     * - sjwoo → testuser1: ✅ 완료 (내가 한 평가 테스트)
     * - sjwoo → testuser2: ❌ 미완료 (평가 작성 테스트)
     * - sjwoo → testuser3: ❌ 미완료 (평가 작성 테스트)
     * - testuser1 → sjwoo: ✅ 완료 (내가 받은 평가 테스트)
     * - testuser2 → sjwoo: ✅ 완료 (내가 받은 평가 테스트)
     * - testuser2 → testuser1: ✅ 완료
     * - testuser3 → sjwoo: ❌ 미완료
     */

    const commentTemplates = [
      '프로젝트에서 정말 열심히 참여해주셨습니다. 덕분에 좋은 결과물을 만들 수 있었어요!',
      '책임감 있게 맡은 업무를 수행해주셔서 협업이 수월했습니다. 감사합니다!',
      '의사소통이 원활하고 팀 분위기를 좋게 만들어주셨어요. 다음에도 함께하고 싶습니다.',
      '기술적 역량이 뛰어나고 문제 해결 능력이 좋았습니다. 많이 배웠습니다!'
    ];

    const getRandomComment = () => commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    const getRandomScore = (min = 3, max = 5) => Math.floor(Math.random() * (max - min + 1)) + min;

    const reviewsToCreate = [
      // sjwoo → testuser1: 완료 (내가 한 평가)
      {
        reviewer_id: sjwooUser.user_id,
        reviewee_id: testUsers[0].user_id,
        role_description: '프론트엔드 개발 담당으로 UI 구현에 기여',
        ability: 5, effort: 5, commitment: 4, communication: 5, reflection: 4, overall_rating: 5,
        comment: '프론트엔드 개발에 탁월한 역량을 보여주셨습니다. 특히 반응형 디자인 구현이 인상적이었어요!'
      },
      // testuser1 → sjwoo: 완료 (내가 받은 평가)
      {
        reviewer_id: testUsers[0].user_id,
        reviewee_id: sjwooUser.user_id,
        role_description: '프로젝트 리더로서 전체 일정 관리 및 팀 조율',
        ability: 5, effort: 5, commitment: 5, communication: 5, reflection: 4, overall_rating: 5,
        comment: '훌륭한 리더십을 발휘해주셨습니다. 팀원들의 의견을 잘 수렴하고 방향성을 잡아주셨어요.'
      },
      // testuser2 → sjwoo: 완료 (내가 받은 평가)
      {
        reviewer_id: testUsers[1].user_id,
        reviewee_id: sjwooUser.user_id,
        role_description: '프로젝트 리더로서 전체 일정 관리 및 팀 조율',
        ability: 4, effort: 5, commitment: 5, communication: 4, reflection: 5, overall_rating: 5,
        comment: '책임감 있게 프로젝트를 이끌어주셨습니다. 덕분에 성공적으로 마무리할 수 있었어요!'
      },
      // testuser2 → testuser1: 완료
      {
        reviewer_id: testUsers[1].user_id,
        reviewee_id: testUsers[0].user_id,
        role_description: '프론트엔드 개발 담당',
        ability: 4, effort: 4, commitment: 4, communication: 4, reflection: 4, overall_rating: 4,
        comment: getRandomComment()
      }
      // sjwoo → testuser2: 미완료 (테스트에서 작성할 예정)
      // sjwoo → testuser3: 미완료 (테스트에서 작성할 예정)
      // testuser3 → sjwoo: 미완료
    ];

    const reviews = [];
    const reviewDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3일 전

    for (const reviewData of reviewsToCreate) {
      // 이미 존재하는 리뷰인지 확인
      const [existing] = await queryInterface.sequelize.query(
        `SELECT review_id FROM reviews
         WHERE project_id = :projectId
         AND reviewer_id = :reviewerId
         AND reviewee_id = :revieweeId`,
        {
          replacements: {
            projectId: project.project_id,
            reviewerId: reviewData.reviewer_id,
            revieweeId: reviewData.reviewee_id
          },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!existing) {
        reviews.push({
          review_id: uuidv4(),
          project_id: project.project_id,
          ...reviewData,
          created_at: reviewDate,
          updated_at: reviewDate
        });
      }
    }

    if (reviews.length > 0) {
      await queryInterface.bulkInsert('reviews', reviews, {});
      console.log(`✅ 리뷰 ${reviews.length}개 생성`);
    } else {
      console.log('⏭️ 모든 리뷰가 이미 존재합니다.');
    }

    // 6. 결과 요약
    console.log('\n📊 E2E 테스트 데이터 시딩 완료 요약:');
    console.log(`   📁 프로젝트: ${project.title} (ID: ${project.project_id})`);
    console.log(`   👥 팀원: ${memberRoles.length}명`);
    console.log(`   ⭐ 완료된 평가: ${reviews.length}개`);
    console.log(`   📝 미완료 평가: sjwoo → testuser2, sjwoo → testuser3, testuser3 → sjwoo`);
    console.log('\n✅ M07 상호평가 E2E 테스트 준비 완료!\n');
  },

  async down(queryInterface, Sequelize) {
    console.log('\n🗑️ E2E 평가 테스트 데이터 삭제 시작...\n');

    // sjwoo 사용자의 E2E 테스트 프로젝트 찾기
    const [project] = await queryInterface.sequelize.query(
      `SELECT p.project_id FROM projects p
       JOIN users u ON p.leader_id = u.user_id
       WHERE u.email = 'sjwoo1999@korea.ac.kr'
       AND p.title = 'E2E 평가 테스트 프로젝트'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (project) {
      // 리뷰 삭제
      await queryInterface.bulkDelete('reviews', {
        project_id: project.project_id
      }, {});
      console.log('✅ 리뷰 삭제 완료');

      // 프로젝트 멤버 삭제
      await queryInterface.bulkDelete('project_members', {
        project_id: project.project_id
      }, {});
      console.log('✅ 프로젝트 멤버 삭제 완료');

      // 프로젝트 삭제
      await queryInterface.bulkDelete('projects', {
        project_id: project.project_id
      }, {});
      console.log('✅ 프로젝트 삭제 완료');
    } else {
      console.log('⚠️ E2E 테스트 프로젝트를 찾을 수 없습니다.');
    }

    console.log('\n🗑️ E2E 평가 테스트 데이터 삭제 완료\n');
  }
};
