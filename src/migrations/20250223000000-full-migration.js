"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // ✅ Admins 테이블
      await queryInterface.createTable(
        "Admins",
        {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
          role: {
            type: Sequelize.ENUM("ADMIN", "MEMBER"),
            defaultValue: "ADMIN",
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

      // ✅ Universities 테이블
      await queryInterface.createTable(
        "Universities",
        {
          ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          Name: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
          },
          Country: {
            type: Sequelize.STRING(100),
            allowNull: false,
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

      // ✅ Campuses 테이블
      await queryInterface.createTable(
        "Campuses",
        {
          ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          UniversityID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "Universities", key: "ID" },
            onDelete: "CASCADE",
          },
          Name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
        },
        { transaction }
      );

      // ✅ Colleges 테이블
      await queryInterface.createTable(
        "Colleges",
        {
          ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          CampusID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "Campuses", key: "ID" },
            onDelete: "CASCADE",
          },
          Name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
        },
        { transaction }
      );

      // ✅ Departments 테이블
      await queryInterface.createTable(
        "Departments",
        {
          ID: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          CollegeID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "Colleges", key: "ID" },
            onDelete: "CASCADE",
          },
          Name: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
        },
        { transaction }
      );

      // ✅ 기존 Users, Recruitments, Projects, Todos 테이블 추가
      await queryInterface.createTable("Users", {
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
        userType: {  // ✅ 이 부분 추가
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
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      });
      
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Departments");
    await queryInterface.dropTable("Colleges");
    await queryInterface.dropTable("Campuses");
    await queryInterface.dropTable("Universities");
    await queryInterface.dropTable("Admins");
  },
};
