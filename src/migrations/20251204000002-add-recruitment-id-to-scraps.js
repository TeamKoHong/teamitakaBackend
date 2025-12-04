'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 scraps 테이블에 recruitment_id 및 updated_at 컬럼 추가 시작...');

      const tableDesc = await queryInterface.describeTable('scraps');

      // 1. recruitment_id 컬럼 추가
      if (!tableDesc.recruitment_id) {
        console.log('🔧 recruitment_id 컬럼 추가 중...');
        await queryInterface.addColumn('scraps', 'recruitment_id', {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'recruitments',
            key: 'recruitment_id'
          },
          onDelete: 'CASCADE'
        });
        console.log('✅ recruitment_id 컬럼 추가 완료');
      } else {
        console.log('✅ recruitment_id 컬럼이 이미 존재합니다.');
      }

      // 2. updated_at 컬럼 추가
      if (!tableDesc.updated_at) {
        console.log('🔧 updated_at 컬럼 추가 중...');
        await queryInterface.addColumn('scraps', 'updated_at', {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        });
        console.log('✅ updated_at 컬럼 추가 완료');
      } else {
        console.log('✅ updated_at 컬럼이 이미 존재합니다.');
      }

      console.log('🎉 scraps 테이블 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ scraps 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 scraps 테이블 롤백 시작...');

      const tableDesc = await queryInterface.describeTable('scraps');

      if (tableDesc.recruitment_id) {
        await queryInterface.removeColumn('scraps', 'recruitment_id');
        console.log('✅ recruitment_id 컬럼 삭제 완료');
      }

      if (tableDesc.updated_at) {
        await queryInterface.removeColumn('scraps', 'updated_at');
        console.log('✅ updated_at 컬럼 삭제 완료');
      }

      console.log('🎉 scraps 롤백 완료!');
    } catch (error) {
      console.error('❌ scraps 롤백 실패:', error);
      throw error;
    }
  }
};
