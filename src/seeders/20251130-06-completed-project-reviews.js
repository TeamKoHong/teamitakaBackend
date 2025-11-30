'use strict';

const { v4: uuidv4 } = require('uuid');

/**
 * 완료 프로젝트 상호평가 목업 데이터 시더 (수정본)
 *
 * 목적: sjwoo1999@korea.ac.kr 계정의 완료 프로젝트에 상호평가 데이터 추가
 * 대상: 완료 프로젝트 10개
 * 수정사항:
 *   - 컬럼명: created_at, updated_at (snake_case)
 *   - 기존 리뷰 comment 업데이트 기능 추가
 *   - 누락된 리뷰만 추가 (중복 방지)
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 코멘트 템플릿
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

    // 1. sjwoo1999@korea.ac.kr 사용자 확인
    const [sjwooUser] = await queryInterface.sequelize.query(
      `SELECT user_id, email, username FROM users WHERE email = 'sjwoo1999@korea.ac.kr'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!sjwooUser) {
      console.log('⚠️ sjwoo1999@korea.ac.kr 사용자가 없습니다.');
      return;
    }

    console.log(`✅ sjwoo1999@korea.ac.kr 사용자 확인: ${sjwooUser.username}`);

    // 2. 기존 빈 comment 업데이트
    const emptyCommentReviews = await queryInterface.sequelize.query(
      `SELECT review_id FROM reviews WHERE comment IS NULL OR comment = ''`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (emptyCommentReviews.length > 0) {
      console.log(`\n📝 빈 comment가 있는 리뷰 ${emptyCommentReviews.length}개 업데이트 중...`);

      for (const review of emptyCommentReviews) {
        await queryInterface.sequelize.query(
          `UPDATE reviews SET comment = :comment WHERE review_id = :reviewId`,
          {
            replacements: {
              comment: getRandomComment(),
              reviewId: review.review_id
            }
          }
        );
      }
      console.log(`✅ ${emptyCommentReviews.length}개 리뷰 comment 업데이트 완료`);
    }

    // 3. sjwoo가 참여한 완료 프로젝트들 조회
    const completedProjects = await queryInterface.sequelize.query(
      `SELECT DISTINCT p.project_id, p.title
       FROM projects p
       JOIN project_members pm ON p.project_id = pm.project_id
       JOIN users u ON pm.user_id = u.user_id
       WHERE u.email = 'sjwoo1999@korea.ac.kr'
         AND p.status = 'COMPLETED'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (completedProjects.length === 0) {
      console.log('⚠️ sjwoo의 완료된 프로젝트가 없습니다.');
      return;
    }

    console.log(`\n✅ 완료 프로젝트 ${completedProjects.length}개 발견:`);
    completedProjects.forEach(p => console.log(`   - ${p.title}`));

    // 4. 각 프로젝트별로 누락된 리뷰 데이터 생성
    const now = new Date();
    const reviewDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7일 전
    const reviews = [];
    let skippedCount = 0;

    for (const project of completedProjects) {
      // 해당 프로젝트의 모든 팀원 조회
      const members = await queryInterface.sequelize.query(
        `SELECT pm.user_id, pm.role, u.username
         FROM project_members pm
         JOIN users u ON pm.user_id = u.user_id
         WHERE pm.project_id = :projectId`,
        {
          replacements: { projectId: project.project_id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      // 기존 리뷰 조회
      const existingReviews = await queryInterface.sequelize.query(
        `SELECT reviewer_id, reviewee_id FROM reviews WHERE project_id = :projectId`,
        {
          replacements: { projectId: project.project_id },
          type: Sequelize.QueryTypes.SELECT
        }
      );

      // 기존 리뷰를 Set으로 변환 (빠른 조회를 위해)
      const existingPairs = new Set(
        existingReviews.map(r => `${r.reviewer_id}-${r.reviewee_id}`)
      );

      console.log(`\n📋 ${project.title}: ${members.length}명 팀원, 기존 리뷰 ${existingReviews.length}개`);

      // 모든 팀원이 서로를 평가 (자기 자신 제외, 기존에 없는 것만)
      for (const reviewer of members) {
        for (const reviewee of members) {
          if (reviewer.user_id !== reviewee.user_id) {
            const pairKey = `${reviewer.user_id}-${reviewee.user_id}`;

            if (existingPairs.has(pairKey)) {
              skippedCount++;
              continue; // 이미 존재하면 스킵
            }

            // 역할 판별 (LEADER, 팀장, 팀장 (풀스택) 등)
            const isLeader = ['LEADER', '팀장', '팀장 (풀스택)'].includes(reviewee.role);

            reviews.push({
              review_id: uuidv4(),
              project_id: project.project_id,
              reviewer_id: reviewer.user_id,
              reviewee_id: reviewee.user_id,
              role_description: isLeader
                ? '프로젝트 리더로서 전체 일정 관리 및 팀 조율'
                : '팀원으로서 담당 기능 개발 및 협업',
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
          }
        }
      }
    }

    // 5. 리뷰 데이터 삽입
    if (reviews.length > 0) {
      await queryInterface.bulkInsert('reviews', reviews, {});
      console.log(`\n✅ ${reviews.length}개의 새 리뷰 데이터 생성 완료`);
      console.log(`⏩ ${skippedCount}개의 기존 리뷰는 스킵됨`);

      // 프로젝트별 통계
      const projectStats = {};
      reviews.forEach(r => {
        if (!projectStats[r.project_id]) {
          projectStats[r.project_id] = { count: 0, totalRating: 0 };
        }
        projectStats[r.project_id].count++;
        projectStats[r.project_id].totalRating += r.overall_rating;
      });

      console.log('\n📊 프로젝트별 새 리뷰 통계:');
      for (const project of completedProjects) {
        const stats = projectStats[project.project_id];
        if (stats) {
          const avgRating = (stats.totalRating / stats.count).toFixed(2);
          console.log(`   - ${project.title}: ${stats.count}개 리뷰, 평균 ${avgRating}점`);
        } else {
          console.log(`   - ${project.title}: 새 리뷰 없음 (이미 완료)`);
        }
      }
    } else {
      console.log('\n⚠️ 추가할 새 리뷰 데이터가 없습니다 (모든 리뷰가 이미 존재함).');
    }

    // 6. 최종 통계
    const [totalCount] = await queryInterface.sequelize.query(
      `SELECT COUNT(*) as count FROM reviews`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    console.log(`\n📈 전체 리뷰 수: ${totalCount.count}개`);
  },

  async down(queryInterface, Sequelize) {
    // sjwoo가 참여한 완료 프로젝트들의 리뷰 삭제
    const completedProjectIds = await queryInterface.sequelize.query(
      `SELECT DISTINCT p.project_id
       FROM projects p
       JOIN project_members pm ON p.project_id = pm.project_id
       JOIN users u ON pm.user_id = u.user_id
       WHERE u.email = 'sjwoo1999@korea.ac.kr'
         AND p.status = 'COMPLETED'`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (completedProjectIds.length > 0) {
      const projectIds = completedProjectIds.map(p => p.project_id);

      await queryInterface.bulkDelete('reviews', {
        project_id: {
          [Sequelize.Op.in]: projectIds
        }
      }, {});

      console.log('🗑️ 완료 프로젝트 리뷰 데이터 삭제 완료');
    }
  }
};
