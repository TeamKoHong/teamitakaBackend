'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Projects', {
      project_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      project_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users', // Users 테이블 참조
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false, // ✅ 모집공고와 반드시 연결
        unique: true,     // ✅ 모집공고와 1:1 관계 유지
        references: {
          model: 'Recruitments', // Recruitments 테이블 참조
          key: 'recruitment_id',
        },
        onDelete: 'CASCADE',
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: true, // 시작일 (필요에 따라 null 허용)
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: true, // 종료일 (필요에 따라 null 허용)
      },
      status: {
        type: Sequelize.ENUM('예정', '진행 중', '완료'),
        defaultValue: '예정',
        allowNull: false,
      },
      project_image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
        allowNull: false,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // ✅ ENUM 타입 제거 (PostgreSQL 고려)
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_Projects_status";');
    await queryInterface.dropTable('Projects');
  },
};
