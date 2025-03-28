'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Todos', {
      todo_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects', // 반드시 `Projects` 테이블을 명시
          key: 'project_id',
        },
        onDelete: 'CASCADE',
      },
      content: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      is_completed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Todos');
  },
};