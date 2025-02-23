"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. 테이블 생성 (외래 키 없이 먼저 생성)
    await queryInterface.createTable("Admins", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "ADMIN",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Universities", {
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Users", {
      user_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      uuid: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        allowNull: false,
        unique: true,
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
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Recruitments", {
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
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // Applications 테이블 추가
    await queryInterface.createTable("Applications", {
      application_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
        defaultValue: "PENDING",
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Projects", {
      project_id: {
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
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Comments", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Likes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Colleges", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UniversityID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Departments", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CollegeID: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      Name: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Notifications", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Reviews", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Keywords", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      keyword: {
        type: Sequelize.STRING,
        unique: true,
      },
      count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("Searches", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      keyword: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      searchTime: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable("VerifiedEmails", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      certified_date: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("DATE_ADD", Sequelize.literal('CURRENT_TIMESTAMP'), Sequelize.literal("INTERVAL 24 HOUR")),
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    // 2. 외래 키 제약 추가
    await queryInterface.addConstraint("Recruitments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_recruitments_user_id",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Applications", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_applications_user_id",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Applications", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_applications_recruitment_id",
      references: {
        table: "Recruitments",
        field: "recruitment_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Projects", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_projects_user_id",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Projects", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_projects_recruitment_id",
      references: {
        table: "Recruitments",
        field: "recruitment_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Comments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_comments_user_id",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Comments", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_comments_recruitment_id",
      references: {
        table: "Recruitments",
        field: "recruitment_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Likes", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_likes_user_id",
      references: {
        table: "Users",
        field: "user_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Likes", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_likes_recruitment_id",
      references: {
        table: "Recruitments",
        field: "recruitment_id",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Colleges", {
      fields: ["UniversityID"],
      type: "foreign key",
      name: "fk_colleges_university_id",
      references: {
        table: "Universities",
        field: "ID",
      },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Departments", {
      fields: ["CollegeID"],
      type: "foreign key",
      name: "fk_departments_college_id",
      references: {
        table: "Colleges",
        field: "ID",
      },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    // 외래 키 제거
    await queryInterface.removeConstraint("Departments", "fk_departments_college_id");
    await queryInterface.removeConstraint("Colleges", "fk_colleges_university_id");
    await queryInterface.removeConstraint("Likes", "fk_likes_recruitment_id");
    await queryInterface.removeConstraint("Likes", "fk_likes_user_id");
    await queryInterface.removeConstraint("Comments", "fk_comments_recruitment_id");
    await queryInterface.removeConstraint("Comments", "fk_comments_user_id");
    await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id");
    await queryInterface.removeConstraint("Projects", "fk_projects_user_id");
    await queryInterface.removeConstraint("Applications", "fk_applications_recruitment_id");
    await queryInterface.removeConstraint("Applications", "fk_applications_user_id");
    await queryInterface.removeConstraint("Recruitments", "fk_recruitments_user_id");

    // 테이블 삭제
    await queryInterface.dropTable("VerifiedEmails");
    await queryInterface.dropTable("Searches");
    await queryInterface.dropTable("Keywords");
    await queryInterface.dropTable("Reviews");
    await queryInterface.dropTable("Notifications");
    await queryInterface.dropTable("Departments");
    await queryInterface.dropTable("Colleges");
    await queryInterface.dropTable("Likes");
    await queryInterface.dropTable("Comments");
    await queryInterface.dropTable("Projects");
    await queryInterface.dropTable("Applications");
    await queryInterface.dropTable("Recruitments");
    await queryInterface.dropTable("Users");
    await queryInterface.dropTable("Universities");
    await queryInterface.dropTable("Admins");
  },
};