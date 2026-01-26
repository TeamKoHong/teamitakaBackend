'use strict';

/**
 * 학교 데이터 통일 스크립트
 *
 * 목적:
 * 1. sjwoo1999@korea.ac.kr 소유 프로젝트의 지원자/멤버를 고려대학교로 통일
 * 2. 학교 미설정 사용자의 모집공고 삭제 (테스트 데이터 정리)
 *
 * 실행: npx sequelize-cli db:seed --seed 20260126-unify-school-data.js
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const targetEmail = 'sjwoo1999@korea.ac.kr';
    const targetUniversity = '고려대학교';

    console.log('');
    console.log('='.repeat(60));
    console.log('  학교 데이터 통일 스크립트');
    console.log('  대상: ' + targetEmail);
    console.log('  변경: 모든 지원자/멤버 → ' + targetUniversity);
    console.log('='.repeat(60));
    console.log('');

    // ========================================
    // 1. 대상 사용자 조회
    // ========================================
    const [targetUser] = await queryInterface.sequelize.query(
      `SELECT user_id, university FROM users WHERE email = :email`,
      {
        replacements: { email: targetEmail },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    if (!targetUser) {
      console.log('❌ 대상 사용자를 찾을 수 없습니다:', targetEmail);
      return;
    }

    console.log('✅ Step 1: 대상 사용자 확인');
    console.log('   - 이메일:', targetEmail);
    console.log('   - 현재 학교:', targetUser.university);
    console.log('   - user_id:', targetUser.user_id);
    console.log('');

    // ========================================
    // 2. 해당 사용자의 모집공고 조회
    // ========================================
    const recruitments = await queryInterface.sequelize.query(
      `SELECT recruitment_id, title FROM recruitments WHERE user_id = :userId`,
      {
        replacements: { userId: targetUser.user_id },
        type: Sequelize.QueryTypes.SELECT
      }
    );

    console.log('✅ Step 2: 모집공고 조회');
    console.log('   - 총 모집공고 수:', recruitments.length);
    recruitments.forEach(r => {
      console.log('     ·', r.title);
    });
    console.log('');

    // ========================================
    // 3. 지원자 중 다른 학교 사용자 조회
    // ========================================
    const applicantsOtherSchool = await queryInterface.sequelize.query(`
      SELECT DISTINCT u.user_id, u.email, u.university
      FROM applications a
      JOIN users u ON a.user_id = u.user_id
      WHERE a.recruitment_id IN (
        SELECT recruitment_id FROM recruitments WHERE user_id = :userId
      )
      AND (u.university IS NULL OR u.university != :targetUniv)
    `, {
      replacements: { userId: targetUser.user_id, targetUniv: targetUniversity },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('✅ Step 3: 다른 학교 지원자 조회');
    console.log('   - 변경 대상 지원자:', applicantsOtherSchool.length, '명');
    applicantsOtherSchool.forEach(u => {
      console.log('     ·', u.email, ':', u.university || 'NULL', '→', targetUniversity);
    });
    console.log('');

    // ========================================
    // 4. 프로젝트 멤버 중 다른 학교 사용자 조회
    // ========================================
    const membersOtherSchool = await queryInterface.sequelize.query(`
      SELECT DISTINCT u.user_id, u.email, u.university
      FROM project_members pm
      JOIN users u ON pm.user_id = u.user_id
      JOIN projects p ON pm.project_id = p.project_id
      WHERE p.user_id = :userId
      AND (u.university IS NULL OR u.university != :targetUniv)
    `, {
      replacements: { userId: targetUser.user_id, targetUniv: targetUniversity },
      type: Sequelize.QueryTypes.SELECT
    });

    console.log('✅ Step 4: 다른 학교 프로젝트 멤버 조회');
    console.log('   - 변경 대상 멤버:', membersOtherSchool.length, '명');
    membersOtherSchool.forEach(u => {
      console.log('     ·', u.email, ':', u.university || 'NULL', '→', targetUniversity);
    });
    console.log('');

    // ========================================
    // 5. 학교 미설정 사용자의 모집공고 조회 및 삭제
    // ========================================
    const nullUniversityRecruitments = await queryInterface.sequelize.query(`
      SELECT r.recruitment_id, r.title, u.email
      FROM recruitments r
      JOIN users u ON r.user_id = u.user_id
      WHERE u.university IS NULL
    `, { type: Sequelize.QueryTypes.SELECT });

    console.log('✅ Step 5: 학교 미설정 사용자의 모집공고');
    console.log('   - 삭제 대상:', nullUniversityRecruitments.length, '개');

    if (nullUniversityRecruitments.length > 0) {
      nullUniversityRecruitments.forEach(r => {
        console.log('     · [삭제]', r.title, '- 작성자:', r.email);
      });

      const idsToDelete = nullUniversityRecruitments.map(r => r.recruitment_id);

      // 관련 applications 먼저 삭제
      await queryInterface.sequelize.query(`
        DELETE FROM applications WHERE recruitment_id IN (:ids)
      `, { replacements: { ids: idsToDelete } });

      // 관련 scraps 삭제
      await queryInterface.sequelize.query(`
        DELETE FROM scraps WHERE recruitment_id IN (:ids)
      `, { replacements: { ids: idsToDelete } });

      // 관련 recruitment_hashtags 삭제
      await queryInterface.sequelize.query(`
        DELETE FROM recruitment_hashtags WHERE recruitment_id IN (:ids)
      `, { replacements: { ids: idsToDelete } });

      // 관련 recruitment_views 삭제
      await queryInterface.sequelize.query(`
        DELETE FROM recruitment_views WHERE recruitment_id IN (:ids)
      `, { replacements: { ids: idsToDelete } });

      // 모집공고 삭제
      await queryInterface.sequelize.query(`
        DELETE FROM recruitments WHERE recruitment_id IN (:ids)
      `, { replacements: { ids: idsToDelete } });

      console.log('   ✅ 삭제 완료');
    }
    console.log('');

    // ========================================
    // 6. 중복 제거 후 업데이트 대상 목록 생성
    // ========================================
    const allUserIds = [...new Set([
      ...applicantsOtherSchool.map(u => u.user_id),
      ...membersOtherSchool.map(u => u.user_id)
    ])];

    console.log('✅ Step 6: 학교 정보 업데이트');
    console.log('   - 총 업데이트 대상 (중복 제거):', allUserIds.length, '명');

    if (allUserIds.length === 0) {
      console.log('   ℹ️  변경할 사용자가 없습니다. 모두 이미', targetUniversity + '입니다.');
    } else {
      // 업데이트 실행
      await queryInterface.sequelize.query(`
        UPDATE users
        SET university = :targetUniv, updated_at = NOW()
        WHERE user_id IN (:userIds)
      `, {
        replacements: { targetUniv: targetUniversity, userIds: allUserIds }
      });

      console.log('   ✅ 업데이트 완료');
    }

    console.log('');
    console.log('='.repeat(60));
    console.log('  완료 요약');
    console.log('='.repeat(60));
    console.log('  - 학교 변경:', allUserIds.length, '명');
    console.log('  - 모집공고 삭제:', nullUniversityRecruitments.length, '개');
    console.log('='.repeat(60));
    console.log('');
  },

  async down(queryInterface, Sequelize) {
    console.log('');
    console.log('⚠️  이 seeder는 롤백을 지원하지 않습니다.');
    console.log('   원래 학교 정보를 복원하려면 백업 데이터가 필요합니다.');
    console.log('');
  }
};
