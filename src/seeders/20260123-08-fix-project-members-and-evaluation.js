'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * 시드 데이터 수정 및 추가 시더
 *
 * 목적:
 * 1. Issue 1 해결: ACTIVE 프로젝트에 적절한 end_date 설정 + project_members에 리더 등록
 * 2. Issue 2 해결: 상호평가 완료된 프로젝트 생성 (sjwoo가 모든 팀원 평가 완료)
 *
 * 대상 사용자: sjwoo1999@korea.ac.kr
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('\n🚀 시드 데이터 수정 및 추가 시작...\n');

    const now = new Date();

    // =========================================================================
    // 1. sjwoo 사용자 조회
    // =========================================================================
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!sjwooUser) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다. 시딩 중단.');
      return;
    }
    console.log(`✅ 테스트 사용자 확인: ${sjwooUser.username} (${sjwooUser.email})`);

    // testuser1, testuser2 조회
    const testUsers = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users
       WHERE email LIKE 'testuser%'
       ORDER BY email
       LIMIT 2`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (testUsers.length < 2) {
      console.log(`⚠️ 테스트 사용자가 부족합니다. 필요: 2명, 발견: ${testUsers.length}명`);
      console.log('💡 먼저 npm run seed:dev로 기본 테스트 사용자를 생성해주세요.');
      return;
    }
    console.log(`✅ 테스트 팀원 확인: ${testUsers.map(u => u.username).join(', ')}`);

    // =========================================================================
    // 2. ACTIVE 프로젝트 end_date 설정 (Issue 1 해결)
    // =========================================================================
    console.log('\n📅 Step 1: ACTIVE 프로젝트 날짜 수정...');

    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30일 후

    const [, updateResult] = await queryInterface.sequelize.query(
      `UPDATE projects
       SET end_date = :endDate,
           start_date = COALESCE(start_date, created_at),
           updated_at = :now
       WHERE user_id = :userId
       AND status = 'ACTIVE'
       AND end_date IS NULL`,
      {
        replacements: {
          userId: sjwooUser.user_id,
          endDate: futureDate,
          now: now
        }
      }
    );

    console.log(`✅ ACTIVE 프로젝트 end_date 설정 완료 (30일 후: ${futureDate.toISOString().split('T')[0]})`);

    // =========================================================================
    // 3. 기존 프로젝트에 project_members 추가 (Issue 1 해결)
    // =========================================================================
    console.log('\n👥 Step 2: 기존 프로젝트에 project_members 등록...');

    const sjwooProjects = await queryInterface.sequelize.query(
      `SELECT project_id, title, status FROM projects WHERE user_id = :userId`,
      {
        replacements: { userId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    console.log(`📋 sjwoo의 프로젝트 ${sjwooProjects.length}개 발견`);

    let addedMemberCount = 0;
    for (const project of sjwooProjects) {
      // 이미 등록되어 있는지 확인
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM project_members WHERE project_id = :projectId AND user_id = :userId`,
        {
          replacements: { projectId: project.project_id, userId: sjwooUser.user_id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!existing) {
        await queryInterface.bulkInsert('project_members', [{
          id: uuidv4(),
          project_id: project.project_id,
          user_id: sjwooUser.user_id,
          role: 'LEADER',
          joined_at: now,
          created_at: now,
          updated_at: now
        }]);
        addedMemberCount++;
        console.log(`   ➕ ${project.title} → LEADER 등록`);
      } else {
        console.log(`   ⏭️ ${project.title} → 이미 등록됨`);
      }
    }
    console.log(`✅ project_members 등록 완료: ${addedMemberCount}개 추가`);

    // =========================================================================
    // 4. 상호평가 완료 프로젝트 생성 (Issue 2 해결)
    // =========================================================================
    console.log('\n🎯 Step 3: 상호평가 완료 프로젝트 생성...');

    const completeEvalProjectTitle = '[상호평가 완료] 팀 협업 프로젝트';

    // 이미 존재하는지 확인
    const [existingProject] = await queryInterface.sequelize.query(
      `SELECT project_id FROM projects WHERE title = :title AND user_id = :leaderId`,
      {
        replacements: { title: completeEvalProjectTitle, leaderId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    let projectId;
    if (existingProject) {
      projectId = existingProject.project_id;
      console.log('⏭️ 상호평가 완료 프로젝트가 이미 존재합니다. 기존 ID 사용.');
    } else {
      projectId = uuidv4();
      const project = {
        project_id: projectId,
        user_id: sjwooUser.user_id,
        title: completeEvalProjectTitle,
        description: '상호평가가 모두 완료된 프로젝트입니다. 모든 팀원이 서로에 대한 평가를 완료했습니다.',
        status: 'COMPLETED',
        start_date: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90일 전
        end_date: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30일 전
        created_at: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        updated_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };

      await queryInterface.bulkInsert('projects', [project], {});
      console.log(`✅ 프로젝트 생성: ${completeEvalProjectTitle}`);
    }

    // =========================================================================
    // 5. 프로젝트 멤버 3명 등록
    // =========================================================================
    console.log('\n👥 Step 4: 프로젝트 멤버 등록...');

    const memberRoles = [
      { user_id: sjwooUser.user_id, role: 'LEADER', username: sjwooUser.username },
      { user_id: testUsers[0].user_id, role: '프론트엔드 개발자', username: testUsers[0].username },
      { user_id: testUsers[1].user_id, role: '백엔드 개발자', username: testUsers[1].username }
    ];

    const membersToAdd = [];
    for (const member of memberRoles) {
      const [existing] = await queryInterface.sequelize.query(
        `SELECT id FROM project_members WHERE project_id = :projectId AND user_id = :userId`,
        {
          replacements: { projectId: projectId, userId: member.user_id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!existing) {
        membersToAdd.push({
          id: uuidv4(),
          project_id: projectId,
          user_id: member.user_id,
          role: member.role,
          joined_at: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000), // 프로젝트 시작 5일 후
          created_at: now,
          updated_at: now
        });
        console.log(`   ➕ ${member.username} (${member.role})`);
      } else {
        console.log(`   ⏭️ ${member.username} → 이미 등록됨`);
      }
    }

    if (membersToAdd.length > 0) {
      await queryInterface.bulkInsert('project_members', membersToAdd, {});
      console.log(`✅ 프로젝트 멤버 ${membersToAdd.length}명 등록 완료`);
    }

    // =========================================================================
    // 6. 모든 리뷰 쌍 생성 (3명 → 6개 리뷰)
    // =========================================================================
    console.log('\n⭐ Step 5: 상호평가 리뷰 생성...');

    const commentTemplates = [
      '프로젝트에서 정말 열심히 참여해주셨습니다. 덕분에 좋은 결과물을 만들 수 있었어요!',
      '책임감 있게 맡은 업무를 수행해주셔서 협업이 수월했습니다. 감사합니다!',
      '의사소통이 원활하고 팀 분위기를 좋게 만들어주셨어요. 다음에도 함께하고 싶습니다.',
      '기술적 역량이 뛰어나고 문제 해결 능력이 좋았습니다. 많이 배웠습니다!',
      '꼼꼼하게 일 처리를 해주셔서 믿음직스러웠습니다. 수고 많으셨어요!',
      '팀워크가 좋았고 서로 배려하며 프로젝트를 진행할 수 있었습니다. 좋은 경험이었어요!'
    ];

    const getRandomComment = () => commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
    const getRandomScore = () => Math.floor(Math.random() * 2) + 4; // 4-5점

    const allMembers = [sjwooUser, ...testUsers];
    const reviewDate = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25일 전

    const reviewsToAdd = [];
    let skippedCount = 0;

    // 모든 멤버 쌍에 대해 리뷰 생성 (자기 자신 제외)
    for (const reviewer of allMembers) {
      for (const reviewee of allMembers) {
        if (reviewer.user_id !== reviewee.user_id) {
          // 이미 존재하는지 확인
          const [existing] = await queryInterface.sequelize.query(
            `SELECT review_id FROM reviews
             WHERE project_id = :projectId
             AND reviewer_id = :reviewerId
             AND reviewee_id = :revieweeId`,
            {
              replacements: {
                projectId: projectId,
                reviewerId: reviewer.user_id,
                revieweeId: reviewee.user_id
              },
              type: Sequelize.QueryTypes.SELECT
            }
          );

          if (existing) {
            skippedCount++;
            continue;
          }

          // 역할 설명 결정
          const isLeader = reviewee.user_id === sjwooUser.user_id;
          const roleDescription = isLeader
            ? '프로젝트 리더로서 전체 일정 관리 및 팀 조율'
            : '팀원으로서 담당 기능 개발 및 협업';

          reviewsToAdd.push({
            review_id: uuidv4(),
            project_id: projectId,
            reviewer_id: reviewer.user_id,
            reviewee_id: reviewee.user_id,
            role_description: roleDescription,
            ability: getRandomScore(),
            effort: getRandomScore(),
            commitment: getRandomScore(),
            communication: getRandomScore(),
            reflection: getRandomScore(),
            overall_rating: getRandomScore(),
            comment: getRandomComment(),
            created_at: reviewDate,
            updated_at: reviewDate
          });

          console.log(`   ➕ ${reviewer.username} → ${reviewee.username}`);
        }
      }
    }

    if (reviewsToAdd.length > 0) {
      await queryInterface.bulkInsert('reviews', reviewsToAdd, {});
      console.log(`✅ 리뷰 ${reviewsToAdd.length}개 생성 완료 (스킵: ${skippedCount}개)`);
    } else {
      console.log(`⏭️ 모든 리뷰가 이미 존재합니다 (스킵: ${skippedCount}개)`);
    }

    // =========================================================================
    // 7. 최종 결과 요약
    // =========================================================================
    console.log('\n' + '='.repeat(60));
    console.log('📊 시드 데이터 수정 및 추가 완료 요약');
    console.log('='.repeat(60));

    // ACTIVE 프로젝트 확인
    const activeProjects = await queryInterface.sequelize.query(
      `SELECT title, status, end_date FROM projects
       WHERE user_id = :userId AND status = 'ACTIVE'`,
      {
        replacements: { userId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    console.log(`\n📌 ACTIVE 프로젝트 (${activeProjects.length}개):`);
    activeProjects.forEach(p => {
      const endDateStr = p.end_date ? new Date(p.end_date).toISOString().split('T')[0] : 'NULL';
      console.log(`   - ${p.title} (end_date: ${endDateStr})`);
    });

    // COMPLETED 프로젝트 확인
    const completedProjects = await queryInterface.sequelize.query(
      `SELECT p.title, p.status,
              (SELECT COUNT(*) FROM project_members pm WHERE pm.project_id = p.project_id) as member_count,
              (SELECT COUNT(*) FROM reviews r WHERE r.project_id = p.project_id AND r.reviewer_id = :userId) as my_reviews
       FROM projects p
       WHERE p.user_id = :userId AND p.status = 'COMPLETED'`,
      {
        replacements: { userId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    console.log(`\n📌 COMPLETED 프로젝트 (${completedProjects.length}개):`);
    completedProjects.forEach(p => {
      const requiredReviews = Math.max(0, parseInt(p.member_count) - 1);
      const myReviews = parseInt(p.my_reviews);
      const evalStatus = requiredReviews === 0 ? 'NOT_REQUIRED'
        : myReviews >= requiredReviews ? 'COMPLETED' : 'PENDING';
      console.log(`   - ${p.title}`);
      console.log(`     멤버: ${p.member_count}명, 내 리뷰: ${myReviews}/${requiredReviews}, 평가상태: ${evalStatus}`);
    });

    console.log('\n✅ 시드 데이터 수정 및 추가 완료!\n');
  },

  async down(queryInterface, Sequelize) {
    console.log('\n🗑️ 시드 데이터 롤백 시작...\n');

    // sjwoo 사용자 조회
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!sjwooUser) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자를 찾을 수 없습니다.');
      return;
    }

    // 상호평가 완료 프로젝트 찾기
    const [project] = await queryInterface.sequelize.query(
      `SELECT project_id FROM projects
       WHERE title = '[상호평가 완료] 팀 협업 프로젝트'
       AND user_id = :leaderId`,
      {
        replacements: { leaderId: sjwooUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
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
      console.log('⚠️ [상호평가 완료] 프로젝트를 찾을 수 없습니다.');
    }

    // 참고: 기존 프로젝트의 project_members와 end_date는 롤백하지 않음
    // (데이터 정합성 유지를 위해)

    console.log('\n🗑️ 시드 데이터 롤백 완료\n');
  }
};
