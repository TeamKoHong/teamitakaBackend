"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Admins 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Universities 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Users 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Recruitments 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Applications 테이블 생성
    await queryInterface.createTable("Applications", {
      application_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Projects 테이블 생성
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
      role: {
        type: Sequelize.STRING,
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
    });

    // Comments 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Likes 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Colleges 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Departments 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Notifications 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Profiles 테이블 생성 (createdAt, updatedAt 기본값 추가)
    await queryInterface.createTable("Profiles", {
      profile_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      nickname: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      university: Sequelize.STRING,
      major1: Sequelize.STRING,
      major2: Sequelize.STRING,
      skills: Sequelize.STRING,
      link: Sequelize.STRING,
      awards: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      ability_graph: Sequelize.JSON,
      strengths: Sequelize.TEXT,
      weaknesses: Sequelize.TEXT,
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

    // Reviews 테이블 생성
    await queryInterface.createTable("Reviews", {
      review_id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      project_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      reviewer_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      reviewee_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      multiple_choice: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      subjective: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      advice: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      secret: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      feedback: {
        type: Sequelize.TEXT,
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
    });

    // Keywords 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Searches 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    // VerifiedEmails 테이블 생성
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
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      expires_at: {
        type: Sequelize.DATE,
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
    });

    // 외래 키 제약 추가
    await queryInterface.addConstraint("Recruitments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_recruitments_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Applications", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_applications_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Applications", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_applications_recruitment_id",
      references: { table: "Recruitments", field: "recruitment_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Projects", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_projects_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Projects", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_projects_recruitment_id",
      references: { table: "Recruitments", field: "recruitment_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Comments", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_comments_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Comments", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_comments_recruitment_id",
      references: { table: "Recruitments", field: "recruitment_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Likes", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_likes_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Likes", {
      fields: ["recruitment_id"],
      type: "foreign key",
      name: "fk_likes_recruitment_id",
      references: { table: "Recruitments", field: "recruitment_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Colleges", {
      fields: ["UniversityID"],
      type: "foreign key",
      name: "fk_colleges_university_id",
      references: { table: "Universities", field: "ID" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Departments", {
      fields: ["CollegeID"],
      type: "foreign key",
      name: "fk_departments_college_id",
      references: { table: "Colleges", field: "ID" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Profiles", {
      fields: ["user_id"],
      type: "foreign key",
      name: "fk_profiles_user_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Reviews", {
      fields: ["project_id"],
      type: "foreign key",
      name: "fk_reviews_project_id",
      references: { table: "Projects", field: "project_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Reviews", {
      fields: ["reviewer_id"],
      type: "foreign key",
      name: "fk_reviews_reviewer_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("Reviews", {
      fields: ["reviewee_id"],
      type: "foreign key",
      name: "fk_reviews_reviewee_id",
      references: { table: "Users", field: "user_id" },
      onDelete: "CASCADE",
    });
  },

  down: async (queryInterface) => {
    // 외래 키 제거
    await queryInterface.removeConstraint("Reviews", "fk_reviews_reviewee_id");
    await queryInterface.removeConstraint("Reviews", "fk_reviews_reviewer_id");
    await queryInterface.removeConstraint("Reviews", "fk_reviews_project_id");
    await queryInterface.removeConstraint("Profiles", "fk_profiles_user_id");
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
    await queryInterface.dropTable("Profiles");
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