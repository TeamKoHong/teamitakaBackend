"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Votes 테이블: createdAt, updatedAt
    await queryInterface.addColumn("Votes", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("Votes", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    });

    // VoteOptions 테이블: createdAt, updatedAt
    await queryInterface.addColumn("VoteOptions", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("VoteOptions", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    });

    // VoteResponses 테이블: createdAt, updatedAt
    await queryInterface.addColumn("VoteResponses", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("VoteResponses", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"),
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Votes", "createdAt");
    await queryInterface.removeColumn("Votes", "updatedAt");

    await queryInterface.removeColumn("VoteOptions", "createdAt");
    await queryInterface.removeColumn("VoteOptions", "updatedAt");

    await queryInterface.removeColumn("VoteResponses", "createdAt");
    await queryInterface.removeColumn("VoteResponses", "updatedAt");
  },
};
