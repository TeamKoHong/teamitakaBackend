"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Recruitments", {
      recruitment_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.STRING(36),
        allowNull: false,
        unique: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("OPEN", "CLOSED"),
        defaultValue: "OPEN",
      },
      project_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Recruitments");
  },
};
