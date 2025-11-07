'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 Users 테이블 생성 시작...');
      
      // 1. Users 테이블 (가장 기본적인 구조)
      await queryInterface.createTable('Users', {
        user_id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false
        },
        username: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING(255),
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('ADMIN', 'MEMBER'),
          allowNull: false,
          defaultValue: 'MEMBER'
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      });
      
      console.log('✅ Users 테이블 생성 완료');
      
      console.log('🚀 EmailVerifications 테이블 확인 시작...');
      
      // 2. EmailVerifications 테이블 (이미 존재하는지 확인)
      const allTables = await queryInterface.showAllTables();
      const emailVerificationExists = allTables.some(table => table === 'EmailVerifications');
      
      if (!emailVerificationExists) {
        console.log('📝 EmailVerifications 테이블이 없어서 생성합니다...');
        await queryInterface.createTable('EmailVerifications', {
          id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          purpose: {
            type: Sequelize.STRING(50),
            allowNull: false,
            defaultValue: 'verification'
          },
          jti: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true
          },
          code_hash: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          expires_at: {
            type: Sequelize.DATE,
            allowNull: false
          },
          consumed_at: {
            type: Sequelize.DATE,
            allowNull: true
          },
          created_ip: {
            type: Sequelize.STRING(45),
            allowNull: true
          },
          ua: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          attempt_count: {
            type: Sequelize.INTEGER,
            allowNull: false,
            defaultValue: 0
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        });
        console.log('✅ EmailVerifications 테이블 생성 완료');
      } else {
        console.log('ℹ️  EmailVerifications 테이블이 이미 존재합니다.');
      }

      // 3. 테이블 생성 검증
      console.log('🔍 테이블 생성 검증 시작...');
      
      const finalTables = await queryInterface.showAllTables();
      console.log('📋 데이터베이스의 모든 테이블:', finalTables);
      
      const usersTableExists = finalTables.some(table => table === 'Users');
      const emailVerificationsTableExists = finalTables.some(table => table === 'EmailVerifications');
      
      console.log(`📊 Users 테이블 존재 여부: ${usersTableExists}`);
      console.log(`📊 EmailVerifications 테이블 존재 여부: ${emailVerificationsTableExists}`);
      
      if (!usersTableExists) {
        throw new Error('Users 테이블이 생성되지 않았습니다.');
      }
      
      if (!emailVerificationsTableExists) {
        throw new Error('EmailVerifications 테이블이 생성되지 않았습니다.');
      }
      
      console.log('✅ 테이블 생성 검증 완료');
      console.log('🎉 기본 스키마 마이그레이션 완료');
    } catch (error) {
      console.error('❌ 마이그레이션 실패:');
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 EmailVerifications 테이블 삭제 시작...');
      await queryInterface.dropTable('EmailVerifications');
      console.log('✅ EmailVerifications 테이블 삭제 완료');
      
      console.log('🔄 Users 테이블 삭제 시작...');
      await queryInterface.dropTable('Users');
      console.log('✅ Users 테이블 삭제 완료');
      
      console.log('🎉 기본 스키마 롤백 완료');
    } catch (error) {
      console.error('❌ 롤백 실패:');
      console.error('오류 메시지:', error.message);
      console.error('오류 스택:', error.stack);
      throw error;
    }
  }
};
