'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 email_verified_at 컬럼 추가 마이그레이션 시작...');
      
      // Users 테이블이 존재하는지 확인
      const tableNames = await queryInterface.showAllTables();
      if (!tableNames.includes('Users')) {
        console.log('⚠️ Users 테이블이 존재하지 않습니다. email_verified_at 컬럼 추가를 건너뜁니다.');
        return;
      }

      // email_verified_at 컬럼이 이미 존재하는지 확인
      const tableDesc = await queryInterface.describeTable('Users');
      if (tableDesc.email_verified_at) {
        console.log('✅ email_verified_at 컬럼이 이미 존재합니다. 마이그레이션을 건너뜁니다.');
        return;
      }

      console.log('🔧 email_verified_at 컬럼을 추가합니다...');
      await queryInterface.addColumn('Users', 'email_verified_at', {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null
      });
      
      console.log('✅ email_verified_at 컬럼 추가 완료');
      console.log('🎉 마이그레이션 성공적으로 완료');
      
    } catch (error) {
      console.error('❌ 마이그레이션 실패:');
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 email_verified_at 컬럼 제거 시작...');
      
      const tableNames = await queryInterface.showAllTables();
      if (!tableNames.includes('Users')) {
        console.log('⚠️ Users 테이블이 존재하지 않습니다. 롤백을 건너뜁니다.');
        return;
      }
      
      const tableDesc = await queryInterface.describeTable('Users');
      if (!tableDesc.email_verified_at) {
        console.log('⚠️ email_verified_at 컬럼이 존재하지 않습니다. 롤백을 건너뜁니다.');
        return;
      }
      
      await queryInterface.removeColumn('Users', 'email_verified_at');
      console.log('✅ email_verified_at 컬럼 제거 완료');
      console.log('🎉 롤백 성공적으로 완료');
      
    } catch (error) {
      console.error('❌ 롤백 실패:');
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      throw error;
    }
  }
};
