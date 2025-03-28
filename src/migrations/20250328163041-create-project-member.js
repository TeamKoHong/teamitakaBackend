'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('ProjectMembers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Projects',
          key: 'project_id',
        },
        onDelete: 'CASCADE',
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'user_id',
        },
        onDelete: 'CASCADE',
      },
      role: {
        type: Sequelize.ENUM('팀장', '팀원'),
        defaultValue: '팀원',
        allowNull: false,
      },
      joined_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      status: {
        type: Sequelize.ENUM('활성', '비활성'),
        defaultValue: '활성',
        allowNull: false,
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
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ProjectMembers');
  }
};
