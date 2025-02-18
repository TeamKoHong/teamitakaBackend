'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("projects", "recruitment_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "recruitments",  // 참조할 테이블
        key: "id",  // 참조할 컬럼
      },
      onDelete: "SET NULL", // 모집공고가 삭제되면 NULL로 설정
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("projects", "recruitment_id");
  },
};

