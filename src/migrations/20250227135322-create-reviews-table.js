"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Reviews", {
      review_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Projects",
          key: "project_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      role_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ability: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      effort: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      commitment: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      communication: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      reflection: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      overall_rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: { min: 1, max: 5 },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("Reviews");
  },
};
