'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 recruitment_views 테이블 마이그레이션 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (!tableNames.includes('recruitment_views')) {
        console.log('🔧 recruitment_views 테이블 생성 중...');

        await queryInterface.createTable('recruitment_views', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id'
            },
            onDelete: 'CASCADE'
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'recruitments',
              key: 'recruitment_id'
            },
            onDelete: 'CASCADE'
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

        console.log('✅ recruitment_views 테이블 생성 완료');

        // 유니크 인덱스 추가 (한 유저는 한 글에 하나의 조회 기록만)
        console.log('🔧 유니크 인덱스 생성 중...');
        await queryInterface.addIndex('recruitment_views',
          ['user_id', 'recruitment_id'],
          {
            unique: true,
            name: 'unique_user_recruitment_view'
          }
        );
        console.log('✅ 유니크 인덱스 생성 완료');

      } else {
        console.log('✅ recruitment_views 테이블이 이미 존재합니다.');
      }

      console.log('🎉 recruitment_views 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ recruitment_views 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 recruitment_views 테이블 롤백 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (tableNames.includes('recruitment_views')) {
        await queryInterface.dropTable('recruitment_views');
        console.log('✅ recruitment_views 테이블 삭제 완료');
      }
    } catch (error) {
      console.error('❌ recruitment_views 롤백 실패:', error);
      throw error;
    }
  }
};
