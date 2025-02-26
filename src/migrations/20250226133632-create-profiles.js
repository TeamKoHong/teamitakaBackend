"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Profiles 테이블이 존재하는지 확인 후 생성
      const tableExists = await queryInterface.sequelize.query(
        `SHOW TABLES LIKE 'Profiles';`,
        { transaction }
      );

      if (tableExists[0].length === 0) {
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
      }

      // ✅ 외래 키가 이미 존재하는지 확인 후 추가
      const [existingConstraints] = await queryInterface.sequelize.query(
        `SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_NAME = 'Profiles' AND CONSTRAINT_NAME = 'fk_profiles_user_id';`,
        { transaction }
      );

      if (existingConstraints.length === 0) {
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
      } else {
        console.log("✅ Foreign key 'fk_profiles_user_id' already exists, skipping creation.");
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("Profiles", { transaction });
    });
  },
};
