"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 🔹 기존 UNIQUE 및 외래 키 제약 제거
      await queryInterface.sequelize.query(
        `ALTER TABLE Projects DROP INDEX recruitment_id;`,
        { transaction }
      );

      try {
        await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      } catch (error) {
        console.log("No existing 'fk_projects_user_id' constraint to remove.");
      }

      try {
        await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id", { transaction });
      } catch (error) {
        console.log("No existing 'fk_projects_recruitment_id' constraint to remove.");
      }

      // 🔹 Projects 테이블 수정 (recruitment_id: NULL 허용)
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        {
          type: Sequelize.CHAR(36),
          allowNull: true,
        },
        { transaction }
      );

      // 🔹 외래 키 추가 전, Projects.recruitment_id 정리
      await queryInterface.sequelize.query(
        `UPDATE Projects p
         LEFT JOIN Recruitments r ON p.recruitment_id = r.recruitment_id
         SET p.recruitment_id = NULL
         WHERE r.recruitment_id IS NULL;`,
        { transaction }
      );

      // 🔹 외래 키 다시 추가
      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );

      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_projects_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );
    });
  },
};
