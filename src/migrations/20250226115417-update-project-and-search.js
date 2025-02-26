"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. 기존 외래 키 제약 조건 제거
      try {
        await queryInterface.removeConstraint("Projects", "fk_recruitments_user_id", { transaction });
      } catch (error) {
        console.log("No existing 'fk_recruitments_user_id' constraint to remove.");
      }
      try {
        await queryInterface.removeConstraint("Projects", "Projects_recruitment_id_fkey", { transaction });
      } catch (error) {
        console.log("No existing 'Projects_recruitment_id_fkey' constraint to remove.");
      }

      // 2. Projects 테이블 수정
      await queryInterface.changeColumn(
        "Projects",
        "title",
        { type: Sequelize.STRING, allowNull: true },
        { transaction }
      );
      await queryInterface.changeColumn(
        "Projects",
        "description",
        { type: Sequelize.TEXT, allowNull: true },
        { transaction }
      );
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        { type: Sequelize.UUID, allowNull: true, unique: true },
        { transaction }
      );

      // 3. 외래 키 재설정 (고유한 이름 사용)
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

      // 4. Search 테이블 생성
      await queryInterface.createTable(
        "Search",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          keyword: { type: Sequelize.STRING, allowNull: false },
          searchTime: { type: Sequelize.DATE, defaultValue: Sequelize.NOW },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
        },
        { transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Search 테이블 삭제
      await queryInterface.dropTable("Search", { transaction });

      // 2. Projects 외래 키 제거
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id", { transaction });

      // 3. Projects 컬럼 원래대로 복구
      await queryInterface.changeColumn(
        "Projects",
        "title",
        { type: Sequelize.STRING, allowNull: false },
        { transaction }
      );
      await queryInterface.changeColumn(
        "Projects",
        "description",
        { type: Sequelize.TEXT, allowNull: false },
        { transaction }
      );
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        { type: Sequelize.UUID, allowNull: false, unique: true },
        { transaction }
      );

      // 4. 이전 외래 키 복원 (고유한 이름 유지)
      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id", // 중복 이름 피하기
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
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
        },
        { transaction }
      );
    });
  },
};