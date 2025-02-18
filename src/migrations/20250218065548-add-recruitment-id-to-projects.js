"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Projects", "recruitment_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "Recruitments",
        key: "recruitment_id",
      },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Projects", "recruitment_id");
  },
};
