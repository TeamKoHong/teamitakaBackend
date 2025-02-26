"use strict";

async function checkAndAddConstraint(queryInterface, tableName, constraintName, constraintOptions, transaction) {
  // 현재 존재하는 외래 키 확인
  const [results] = await queryInterface.sequelize.query(`
      SELECT CONSTRAINT_NAME 
      FROM information_schema.TABLE_CONSTRAINTS 
      WHERE TABLE_NAME = '${tableName}' 
      AND CONSTRAINT_NAME = '${constraintName}';
  `, { transaction });

  // 기존에 존재하지 않는 경우에만 추가
  if (results.length === 0) {
    await queryInterface.addConstraint(tableName, constraintOptions, { transaction });
  } else {
    console.log(`Skipping constraint '${constraintName}', already exists.`);
  }
}

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
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

      // Projects 테이블 수정
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

      // 외래 키 중복 체크 후 추가
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

      // Search 테이블 생성
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
      // Search 테이블 삭제
      await queryInterface.dropTable("Search", { transaction });

      // Projects 외래 키 제거
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id", { transaction });

      // Projects 컬럼 원래대로 복구
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

      // 이전 외래 키 복원 (고유한 이름 유지)
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
