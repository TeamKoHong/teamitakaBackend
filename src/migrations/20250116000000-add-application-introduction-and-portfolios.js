'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 지원서 포트폴리오 기능 마이그레이션 시작...');

      // 1. Applications 테이블에 introduction 컬럼 추가
      const applicationsTableDesc = await queryInterface.describeTable('applications');

      if (!applicationsTableDesc.introduction) {
        console.log('🔧 applications 테이블에 introduction 컬럼 추가 중...');
        await queryInterface.addColumn('applications', 'introduction', {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: '', // 기존 데이터를 위한 임시 기본값
        });
        console.log('✅ introduction 컬럼 추가 완료');
      } else {
        console.log('✅ introduction 컬럼이 이미 존재합니다.');
      }

      // 2. application_portfolios 테이블 생성
      const tableNames = await queryInterface.showAllTables();

      if (!tableNames.includes('application_portfolios')) {
        console.log('🔧 application_portfolios 테이블 생성 중...');
        await queryInterface.createTable('application_portfolios', {
          application_id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'applications',
              key: 'application_id',
            },
            onDelete: 'CASCADE',
          },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            references: {
              model: 'projects',
              key: 'project_id',
            },
            onDelete: 'CASCADE',
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        });
        console.log('✅ application_portfolios 테이블 생성 완료');
      } else {
        console.log('✅ application_portfolios 테이블이 이미 존재합니다.');
      }

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
      console.log('🔄 지원서 포트폴리오 기능 롤백 시작...');

      // 1. application_portfolios 테이블 삭제
      const tableNames = await queryInterface.showAllTables();
      if (tableNames.includes('application_portfolios')) {
        console.log('🔧 application_portfolios 테이블 삭제 중...');
        await queryInterface.dropTable('application_portfolios');
        console.log('✅ application_portfolios 테이블 삭제 완료');
      }

      // 2. applications 테이블에서 introduction 컬럼 제거
      const applicationsTableDesc = await queryInterface.describeTable('applications');
      if (applicationsTableDesc.introduction) {
        console.log('🔧 applications 테이블에서 introduction 컬럼 제거 중...');
        await queryInterface.removeColumn('applications', 'introduction');
        console.log('✅ introduction 컬럼 제거 완료');
      }

      console.log('🎉 롤백 성공적으로 완료');

    } catch (error) {
      console.error('❌ 롤백 실패:');
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      throw error;
    }
  }
};
