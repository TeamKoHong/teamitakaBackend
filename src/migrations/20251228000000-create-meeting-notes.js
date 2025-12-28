'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      console.log('🚀 meeting_notes 테이블 마이그레이션 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (!tableNames.includes('meeting_notes')) {
        console.log('🔧 meeting_notes 테이블 생성 중...');

        await queryInterface.createTable('meeting_notes', {
          meeting_id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
            allowNull: false
          },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'projects',
              key: 'project_id'
            },
            onDelete: 'CASCADE'
          },
          created_by: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'user_id'
            },
            onDelete: 'CASCADE'
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false
          },
          content: {
            type: Sequelize.TEXT,
            allowNull: true
          },
          meeting_date: {
            type: Sequelize.DATE,
            allowNull: false
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

        console.log('✅ meeting_notes 테이블 생성 완료');

        // 프로젝트별 회의록 조회를 위한 인덱스
        console.log('🔧 project_id 인덱스 생성 중...');
        await queryInterface.addIndex('meeting_notes', ['project_id'], {
          name: 'idx_meeting_notes_project_id'
        });
        console.log('✅ project_id 인덱스 생성 완료');

        // 회의 날짜별 정렬을 위한 인덱스
        console.log('🔧 meeting_date 인덱스 생성 중...');
        await queryInterface.addIndex('meeting_notes', ['meeting_date'], {
          name: 'idx_meeting_notes_meeting_date'
        });
        console.log('✅ meeting_date 인덱스 생성 완료');

      } else {
        console.log('✅ meeting_notes 테이블이 이미 존재합니다.');
      }

      console.log('🎉 meeting_notes 마이그레이션 완료!');
    } catch (error) {
      console.error('❌ meeting_notes 마이그레이션 실패:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      console.log('🔄 meeting_notes 테이블 롤백 시작...');

      const tableNames = await queryInterface.showAllTables();

      if (tableNames.includes('meeting_notes')) {
        await queryInterface.dropTable('meeting_notes');
        console.log('✅ meeting_notes 테이블 삭제 완료');
      }
    } catch (error) {
      console.error('❌ meeting_notes 롤백 실패:', error);
      throw error;
    }
  }
};
