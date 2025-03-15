"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Votes 테이블 생성
    await queryInterface.createTable("Votes", {
      vote_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
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
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });

    // VoteOptions 테이블 생성
    await queryInterface.createTable("VoteOptions", {
      option_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      vote_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Votes",
          key: "vote_id",
        },
        onDelete: "CASCADE",
      },
      option_text: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    });

    // VoteResponses 테이블 생성
    await queryInterface.createTable("VoteResponses", {
      response_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      vote_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Votes",
          key: "vote_id",
        },
        onDelete: "CASCADE",
      },
      option_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "VoteOptions",
          key: "option_id",
        },
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("VoteResponses");
    await queryInterface.dropTable("VoteOptions");
    await queryInterface.dropTable("Votes");
  },
};
