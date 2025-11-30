'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 Projects 테이블에 user_id 컬럼 추가 시작...');

      const tableDescription = await queryInterface.describeTable('projects');

      if (!tableDescription.user_id) {
        await queryInterface.addColumn('projects', 'user_id', {
          type: Sequelize.UUID,
          allowNull: true,  // 기존 데이터 호환을 위해 nullable
          references: {
            model: 'users',
            key: 'user_id',
          },
          onDelete: 'SET NULL',
        });
        console.log('✅ user_id 컬럼 추가 완료');
      } else {
        console.log('✅ user_id 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 Projects user_id 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 Projects 테이블 user_id 컬럼 롤백 시작...');

      const tableDescription = await queryInterface.describeTable('projects');

      if (tableDescription.user_id) {
        await queryInterface.removeColumn('projects', 'user_id');
        console.log('✅ user_id 컬럼 제거 완료');
      }

      console.log('🎉 Projects user_id 롤백 완료!');
    } catch (error) {
      console.error('❌ 롤백 실패:', error);
      throw error;
    }
  }
};
