"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ 기존 외래 키(FK) 존재 여부 확인 후 필요 시 삭제
      const [existingConstraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_NAME = 'Projects' AND CONSTRAINT_NAME = 'fk_projects_user_id';`,
        { transaction }
      );

      if (existingConstraints.length > 0) {
        console.log("✅ Foreign key 'fk_projects_user_id' already exists, removing...");
        await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      }

      // ✅ 외래 키 추가 (Profiles -> Projects)
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
      // 🔹 외래 키 제거
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
    });
  },
};
