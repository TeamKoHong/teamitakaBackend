"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ 1. Profiles 테이블이 존재하는지 확인
      const [tableExists] = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE 'Profiles';`,
        { transaction }
      );

      // ✅ 2. Profiles 테이블이 없으면 새로 생성
      if (tableExists.length === 0) {
        await queryInterface.createTable(
          "Profiles",
          {
            profile_id: {
              type: Sequelize.INTEGER,
              autoIncrement: true,
              primaryKey: true,
            },
            user_id: {
              type: Sequelize.CHAR(36).BINARY,
              allowNull: false,
            },
            nickname: {
              type: Sequelize.STRING(255),
              allowNull: false,
            },
            profileImageUrl: {
              type: Sequelize.STRING(255),
              allowNull: true,
            },
            createdAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
            updatedAt: {
              type: Sequelize.DATE,
              allowNull: false,
              defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
            },
          },
          { transaction }
        );
      } else {
        console.log("✅ Profiles table already exists.");
      }

      // ✅ 3. 기존 FK(`fk_profiles_user_id`) 존재 여부 확인 후 추가
      const [existingConstraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_NAME = 'Profiles' AND CONSTRAINT_NAME = 'fk_profiles_user_id';`,
        { transaction }
      );

      if (existingConstraints.length > 0) {
        console.log("✅ Foreign key 'fk_profiles_user_id' already exists, removing...");
        await queryInterface.removeConstraint("Profiles", "fk_profiles_user_id", { transaction });
      }

      // ✅ 4. 외래 키 다시 추가 (Profiles.user_id → Users.user_id)
      await queryInterface.addConstraint(
        "Profiles",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_profiles_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        { transaction }
      );

      console.log("✅ Foreign key 'fk_profiles_user_id' successfully added.");
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Profiles 테이블이 존재하면 삭제
      const [tableExists] = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE 'Profiles';`,
        { transaction }
      );

      if (tableExists.length > 0) {
        await queryInterface.dropTable("Profiles", { transaction });
        console.log("✅ Profiles table successfully dropped.");
      } else {
        console.log("⚠️ Profiles table does not exist. Skipping drop.");
      }
    });
  },
};
