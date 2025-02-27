"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Users", "nickname", {
      type: Sequelize.STRING(255),
      allowNull: false,
      unique: true,
    });

    await queryInterface.addColumn("Users", "university", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "major", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "avatar", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "bio", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "awards", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "skills", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("Users", "portfolio_url", {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Users", "nickname");
    await queryInterface.removeColumn("Users", "university");
    await queryInterface.removeColumn("Users", "major");
    await queryInterface.removeColumn("Users", "avatar");
    await queryInterface.removeColumn("Users", "bio");
    await queryInterface.removeColumn("Users", "awards");
    await queryInterface.removeColumn("Users", "skills");
    await queryInterface.removeColumn("Users", "portfolio_url");
  }
};
