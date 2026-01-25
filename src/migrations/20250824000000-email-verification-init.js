"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1) Users.email_verified_at 추가 (테이블이 존재하는 경우에만)
      try {
        const tableNames = await queryInterface.showAllTables({ transaction });
        const hasUsersTable = tableNames.includes("Users");
        
        if (hasUsersTable) {
          const tableDesc = await queryInterface.describeTable("Users");
          if (!tableDesc.email_verified_at) {
            await queryInterface.addColumn(
              "Users",
              "email_verified_at",
              { type: Sequelize.DATE, allowNull: true },
              { transaction }
            );
          }
        }
      } catch (error) {
        console.log("Users 테이블이 존재하지 않거나 접근할 수 없습니다:", error.message);
      }

      // 2) EmailVerifications 테이블 생성
      const tableNames = await queryInterface.showAllTables({ transaction });
      const hasEmailVerifications = tableNames.includes("EmailVerifications");
      if (!hasEmailVerifications) {
        await queryInterface.createTable(
          "EmailVerifications",
          {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
            email: { type: Sequelize.STRING(255), allowNull: false },
            purpose: { type: Sequelize.ENUM("signup", "login", "change"), allowNull: false },
            jti: { type: Sequelize.UUID, allowNull: false },
            token_hash: { type: Sequelize.STRING(255), allowNull: true },
            code_hash: { type: Sequelize.STRING(255), allowNull: true },
            expires_at: { type: Sequelize.DATE, allowNull: false },
            consumed_at: { type: Sequelize.DATE, allowNull: true },
            sent_provider: { type: Sequelize.STRING(50), allowNull: true },
            created_ip: { type: Sequelize.STRING(64), allowNull: true },
            ua: { type: Sequelize.STRING(512), allowNull: true },
            createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
            updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          },
          { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
        );

        await queryInterface.addIndex("EmailVerifications", ["email", "purpose"], { transaction });
        await queryInterface.addIndex("EmailVerifications", ["jti"], { transaction });
        await queryInterface.addIndex("EmailVerifications", ["expires_at"], { transaction });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      const tableNames = await queryInterface.showAllTables({ transaction });
      if (tableNames.includes("EmailVerifications")) {
        await queryInterface.dropTable("EmailVerifications", { transaction });
      }

      // Users 테이블이 존재하는 경우에만 컬럼 제거
      try {
        const hasUsersTable = tableNames.includes("Users");
        if (hasUsersTable) {
          const tableDesc = await queryInterface.describeTable("Users");
          if (tableDesc.email_verified_at) {
            await queryInterface.removeColumn("Users", "email_verified_at", { transaction });
          }
        }
      } catch (error) {
        console.log("Users 테이블에서 컬럼 제거 실패:", error.message);
      }
    });
  },
};


