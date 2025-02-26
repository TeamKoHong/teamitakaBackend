"use strict";

async function checkAndAddConstraint(queryInterface, tableName, constraintName, constraintOptions, transaction) {
  try {
    await queryInterface.removeConstraint(tableName, constraintName, { transaction });
    console.log(`Removed existing constraint '${constraintName}'.`);
  } catch (error) {
    console.log(`Skipping removal: '${constraintName}', constraint does not exist.`);
  }

  try {
    await queryInterface.addConstraint(tableName, constraintOptions, { transaction });
    console.log(`Added constraint '${constraintName}'.`);
  } catch (error) {
    console.error(`Failed to add constraint '${constraintName}':`, error);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 🔹 기존 외래 키 및 UNIQUE 제약 제거
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

      try {
        await queryInterface.removeConstraint("Projects", "recruitment_id", { transaction });
      } catch (error) {
        console.log("No existing 'recruitment_id' UNIQUE constraint to remove.");
      }

      // 🔹 Projects 테이블 수정 (recruitment_id: UNIQUE 제거 + NULL 허용)
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        {
          type: Sequelize.CHAR(36),
          allowNull: true, // ✅ NULL 허용
        },
        { transaction }
      );

      // 🔹 외래 키 다시 추가
      await checkAndAddConstraint(
        queryInterface,
        "Projects",
        "fk_projects_user_id",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        transaction
      );

      await checkAndAddConstraint(
        queryInterface,
        "Projects",
        "fk_projects_recruitment_id",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_projects_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        transaction
      );

      // 🔹 Search 테이블 생성
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
      // 🔹 Search 테이블 삭제
      await queryInterface.dropTable("Search", { transaction });

      // 🔹 Projects 외래 키 제거
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id", { transaction });

      // 🔹 Projects 컬럼 원래대로 복구 (NULL 허용 X, UNIQUE 복원)
      await queryInterface.changeColumn(
        "Projects",
        "recruitment_id",
        {
          type: Sequelize.CHAR(36),
          allowNull: false,
          unique: true, // 🚨 원래대로 UNIQUE 복원 (이전 상태로 되돌리기)
        },
        { transaction }
      );

      // 🔹 이전 외래 키 복원
      await checkAndAddConstraint(
        queryInterface,
        "Projects",
        "fk_projects_user_id",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        transaction
      );

      await checkAndAddConstraint(
        queryInterface,
        "Projects",
        "fk_projects_recruitment_id",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_projects_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
        },
        transaction
      );
    });
  },
};
