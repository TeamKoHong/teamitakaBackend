'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 device_tokens 테이블 마이그레이션 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (!tableNames.includes('device_tokens')) {
        console.log('🔧 device_tokens 테이블 생성 중...');

        await queryInterface.createTable('device_tokens', {
          id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id',
            },
            onDelete: 'CASCADE',
          },
          device_token: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          platform: {
            type: Sequelize.ENUM('ios', 'android'),
            allowNull: false,
            defaultValue: 'ios',
          },
          is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true,
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
        });

        console.log('✅ device_tokens 테이블 생성 완료');

        // Unique constraint for user_id + device_token
        console.log('🔧 유니크 인덱스 생성 중...');
        await queryInterface.addIndex('device_tokens',
          ['user_id', 'device_token'],
          {
            unique: true,
            name: 'unique_user_device_token',
          }
        );

        // Index for user_id lookups
        await queryInterface.addIndex('device_tokens',
          ['user_id'],
          {
            name: 'idx_device_tokens_user_id',
          }
        );

        console.log('✅ 인덱스 생성 완료');

      } else {
        console.log('✅ device_tokens 테이블이 이미 존재합니다.');
      }

      console.log('🎉 device_tokens 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ device_tokens 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 device_tokens 테이블 롤백 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (tableNames.includes('device_tokens')) {
        await queryInterface.dropTable('device_tokens');
        console.log('✅ device_tokens 테이블 삭제 완료');
      }
    } catch (error) {
      console.error('❌ device_tokens 롤백 실패:', error);
      throw error;
    }
  }
};
