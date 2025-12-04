'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 recruitments 테이블 컬럼 추가 마이그레이션 시작...');

      // 현재 테이블의 컬럼 목록 확인
      const tableInfo = await queryInterface.describeTable('recruitments');

      // user_id 컬럼 추가 (작성자 ID - 필수)
      if (!tableInfo.user_id) {
        console.log('🔧 user_id 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'user_id', {
          type: Sequelize.UUID,
          allowNull: true, // 기존 데이터 호환을 위해 일단 nullable
          references: {
            model: 'users',
            key: 'user_id'
          },
          onDelete: 'CASCADE'
        });
        console.log('✅ user_id 컬럼 추가 완료');
      } else {
        console.log('✅ user_id 컬럼이 이미 존재합니다.');
      }

      // views 컬럼 추가 (조회수)
      if (!tableInfo.views) {
        console.log('🔧 views 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'views', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        });
        console.log('✅ views 컬럼 추가 완료');
      } else {
        console.log('✅ views 컬럼이 이미 존재합니다.');
      }

      // max_applicants 컬럼 추가 (최대 지원자 수)
      if (!tableInfo.max_applicants) {
        console.log('🔧 max_applicants 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'max_applicants', {
          type: Sequelize.INTEGER,
          allowNull: true,
          defaultValue: 10
        });
        console.log('✅ max_applicants 컬럼 추가 완료');
      } else {
        console.log('✅ max_applicants 컬럼이 이미 존재합니다.');
      }

      // recruitment_start 컬럼 추가 (모집 시작일)
      if (!tableInfo.recruitment_start) {
        console.log('🔧 recruitment_start 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'recruitment_start', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('✅ recruitment_start 컬럼 추가 완료');
      } else {
        console.log('✅ recruitment_start 컬럼이 이미 존재합니다.');
      }

      // recruitment_end 컬럼 추가 (모집 마감일)
      if (!tableInfo.recruitment_end) {
        console.log('🔧 recruitment_end 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'recruitment_end', {
          type: Sequelize.DATE,
          allowNull: true
        });
        console.log('✅ recruitment_end 컬럼 추가 완료');
      } else {
        console.log('✅ recruitment_end 컬럼이 이미 존재합니다.');
      }

      // project_type 컬럼 추가 (프로젝트 타입)
      if (!tableInfo.project_type) {
        console.log('🔧 project_type 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'project_type', {
          type: Sequelize.ENUM('course', 'side'),
          allowNull: true
        });
        console.log('✅ project_type 컬럼 추가 완료');
      } else {
        console.log('✅ project_type 컬럼이 이미 존재합니다.');
      }

      // photo_url 컬럼 추가 (대표 이미지)
      if (!tableInfo.photo_url) {
        console.log('🔧 photo_url 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'photo_url', {
          type: Sequelize.TEXT,
          allowNull: true
        });
        console.log('✅ photo_url 컬럼 추가 완료');
      } else {
        console.log('✅ photo_url 컬럼이 이미 존재합니다.');
      }

      // scrap_count 컬럼 추가 (스크랩/북마크 수)
      if (!tableInfo.scrap_count) {
        console.log('🔧 scrap_count 컬럼 추가 중...');
        await queryInterface.addColumn('recruitments', 'scrap_count', {
          type: Sequelize.INTEGER,
          defaultValue: 0
        });
        console.log('✅ scrap_count 컬럼 추가 완료');
      } else {
        console.log('✅ scrap_count 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 recruitments 테이블 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ recruitments 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 recruitments 테이블 컬럼 롤백 시작...');

      const tableInfo = await queryInterface.describeTable('recruitments');

      if (tableInfo.user_id) {
        await queryInterface.removeColumn('recruitments', 'user_id');
        console.log('✅ user_id 컬럼 삭제 완료');
      }

      if (tableInfo.views) {
        await queryInterface.removeColumn('recruitments', 'views');
        console.log('✅ views 컬럼 삭제 완료');
      }

      if (tableInfo.max_applicants) {
        await queryInterface.removeColumn('recruitments', 'max_applicants');
        console.log('✅ max_applicants 컬럼 삭제 완료');
      }

      if (tableInfo.recruitment_start) {
        await queryInterface.removeColumn('recruitments', 'recruitment_start');
        console.log('✅ recruitment_start 컬럼 삭제 완료');
      }

      if (tableInfo.recruitment_end) {
        await queryInterface.removeColumn('recruitments', 'recruitment_end');
        console.log('✅ recruitment_end 컬럼 삭제 완료');
      }

      if (tableInfo.project_type) {
        await queryInterface.removeColumn('recruitments', 'project_type');
        // ENUM 타입도 삭제
        await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_recruitments_project_type";');
        console.log('✅ project_type 컬럼 삭제 완료');
      }

      if (tableInfo.photo_url) {
        await queryInterface.removeColumn('recruitments', 'photo_url');
        console.log('✅ photo_url 컬럼 삭제 완료');
      }

      if (tableInfo.scrap_count) {
        await queryInterface.removeColumn('recruitments', 'scrap_count');
        console.log('✅ scrap_count 컬럼 삭제 완료');
      }

      console.log('✅ recruitments 테이블 롤백 완료');
    } catch (error) {
      console.error('❌ recruitments 롤백 실패:', error);
      throw error;
    }
  }
};
