"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Profiles 테이블 생성
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

      // ✅ Users 테이블과 관계 설정 (Profiles.user_id -> Users.user_id)
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 🔹 Profiles 테이블 삭제
      await queryInterface.dropTable("Profiles", { transaction });
    });
  },
};
