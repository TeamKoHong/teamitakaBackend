"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("recruitments", "start_date", {
      type: Sequelize.DATE,
      allowNull: false, // 필수 입력값
    });

    await queryInterface.addColumn("recruitments", "end_date", {
      type: Sequelize.DATE,
      allowNull: false, // 필수 입력값
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("recruitments", "start_date");
    await queryInterface.removeColumn("recruitments", "end_date");
  },
};
