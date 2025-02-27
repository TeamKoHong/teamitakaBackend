"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Users 테이블
      await queryInterface.createTable(
        "Users",
        {
          user_id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          username: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          email: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          password: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          profileImageUrl: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          userType: {
            type: Sequelize.ENUM("ADMIN", "MEMBER"),
            defaultValue: "MEMBER",
          },
          role: {
            type: Sequelize.ENUM("ADMIN", "MEMBER"),
            defaultValue: "MEMBER",
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );

      // ✅ Projects 테이블
      await queryInterface.createTable(
        "Projects",
        {
          project_id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: "Default Project",
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: "Default Description",
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
          },
          start_date: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          end_date: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          status: {
            type: Sequelize.ENUM("예정", "진행 중", "완료"),
            defaultValue: "예정",
            allowNull: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );

      // ✅ Recruitments 테이블
      await queryInterface.createTable(
        "Recruitments",
        {
          recruitment_id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM("OPEN", "CLOSED"),
            defaultValue: "OPEN",
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );

      // ✅ Todos 테이블
      await queryInterface.createTable(
        "Todos",
        {
          todo_id: {
            type: Sequelize.UUID,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          task: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          completed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.NOW,
          },
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Todos");
    await queryInterface.dropTable("Recruitments");
    await queryInterface.dropTable("Projects");
    await queryInterface.dropTable("Users");
  },
};
