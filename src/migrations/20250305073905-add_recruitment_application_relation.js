"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 테이블 구조 확인
    const tableDefinition = await queryInterface.describeTable("Applications");

    // recruitment_id 컬럼이 없을 경우에만 추가
    if (!tableDefinition.recruitment_id) {
      await queryInterface.addColumn("Applications", "recruitment_id", {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
        onDelete: "CASCADE",
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    // rollback 시에는 컬럼을 삭제
    const tableDefinition = await queryInterface.describeTable("Applications");
    if (tableDefinition.recruitment_id) {
      await queryInterface.removeColumn("Applications", "recruitment_id");
    }
  },
};
