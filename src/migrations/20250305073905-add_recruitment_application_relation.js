"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Applications", "recruitment_id", {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: "Recruitments",
        key: "recruitment_id",
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Applications", "recruitment_id");
  },
};
