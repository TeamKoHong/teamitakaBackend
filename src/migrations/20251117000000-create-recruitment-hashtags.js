'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 recruitment_hashtags junction table 마이그레이션 시작...');

      // recruitment_hashtags 테이블 존재 여부 확인
      const tableNames = await queryInterface.showAllTables();

      if (!tableNames.includes('recruitment_hashtags')) {
        console.log('🔧 recruitment_hashtags 테이블 생성 중...');

        await queryInterface.createTable('recruitment_hashtags', {
          id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'recruitments',
              key: 'recruitment_id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          hashtag_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'hashtags',  // 실제 DB 테이블명 (소문자)
              key: 'hashtag_id'   // 실제 DB 컬럼명
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
          }
        });

        console.log('✅ recruitment_hashtags 테이블 생성 완료');

        // 복합 유니크 인덱스 추가 (중복 방지)
        console.log('🔧 유니크 인덱스 생성 중...');
        await queryInterface.addIndex('recruitment_hashtags',
          ['recruitment_id', 'hashtag_id'],
          {
            unique: true,
            name: 'unique_recruitment_hashtag'
          }
        );
        console.log('✅ 유니크 인덱스 생성 완료');

      } else {
        console.log('✅ recruitment_hashtags 테이블이 이미 존재합니다.');
      }

      console.log('🎉 recruitment_hashtags 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ recruitment_hashtags 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 recruitment_hashtags 테이블 롤백 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (tableNames.includes('recruitment_hashtags')) {
        await queryInterface.dropTable('recruitment_hashtags');
        console.log('✅ recruitment_hashtags 테이블 삭제 완료');
      }
    } catch (error) {
      console.error('❌ recruitment_hashtags 롤백 실패:', error);
      throw error;
    }
  }
};
