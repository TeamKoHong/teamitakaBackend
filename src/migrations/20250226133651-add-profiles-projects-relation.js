"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Projects 테이블이 Profiles.user_id와 연결되도록 설정
      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id",
          references: { table: "Profiles", field: "user_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 🔹 외래 키 제거 (Projects -> Profiles)
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
    });
  },
};
