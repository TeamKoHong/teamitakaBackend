'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      // 1. Users 테이블 (가장 기본적인 구조)
      await queryInterface.createTable('Users', {
        user_id: {
          type: Sequelize.CHAR(36).BINARY,
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
        userType: {
          type: Sequelize.ENUM('ADMIN', 'MEMBER'),
          defaultValue: 'MEMBER'
        },
        role: {
          type: Sequelize.ENUM('ADMIN', 'MEMBER'),
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

      // 2. EmailVerifications 테이블
      await queryInterface.createTable('EmailVerifications', {
        id: {
          type: Sequelize.CHAR(36).BINARY,
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

      console.log('✅ 기본 스키마 마이그레이션 완료');
    } catch (error) {
      console.error('❌ 마이그레이션 실패:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.dropTable('EmailVerifications');
      await queryInterface.dropTable('Users');
      console.log('✅ 기본 스키마 롤백 완료');
    } catch (error) {
      console.error('❌ 롤백 실패:', error.message);
      throw error;
    }
  }
};
