'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 Projects 테이블에 날짜 컬럼 추가 마이그레이션 시작...');

      const tableDescription = await queryInterface.describeTable('projects');

      // start_date 컬럼 추가
      if (!tableDescription.start_date) {
        console.log('🔧 start_date 컬럼 추가 중...');
        await queryInterface.addColumn('projects', 'start_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: '프로젝트 시작일'
        });
        console.log('✅ start_date 컬럼 추가 완료');
      } else {
        console.log('✅ start_date 컬럼이 이미 존재합니다.');
      }

      // end_date 컬럼 추가
      if (!tableDescription.end_date) {
        console.log('🔧 end_date 컬럼 추가 중...');
        await queryInterface.addColumn('projects', 'end_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: '프로젝트 종료일'
        });
        console.log('✅ end_date 컬럼 추가 완료');
      } else {
        console.log('✅ end_date 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 Projects 날짜 컬럼 추가 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ Projects 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 Projects 테이블 날짜 컬럼 롤백 시작...');

      const tableDescription = await queryInterface.describeTable('projects');

      // start_date 컬럼 제거
      if (tableDescription.start_date) {
        console.log('🔧 start_date 컬럼 제거 중...');
        await queryInterface.removeColumn('projects', 'start_date');
        console.log('✅ start_date 컬럼 제거 완료');
      }

      // end_date 컬럼 제거
      if (tableDescription.end_date) {
        console.log('🔧 end_date 컬럼 제거 중...');
        await queryInterface.removeColumn('projects', 'end_date');
        console.log('✅ end_date 컬럼 제거 완료');
      }

      console.log('🎉 Projects 날짜 컬럼 롤백 완료!');
    } catch (error) {
      console.error('❌ Projects 롤백 실패:', error);
      throw error;
    }
  }
};
