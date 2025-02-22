// migrations/xxxxxx-create-scraps-table.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Scraps', {
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
          model: 'Users', // 'Users' 테이블을 참조
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Recruitments', // 'Recruitments' 테이블을 참조
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    // 'Scraps' 테이블을 삭제
    await queryInterface.dropTable('Scraps');
  }
};
