"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Users 테이블 생성 (참조되는 기본 테이블)
    await queryInterface.createTable("Users", {
      user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 2. Admins 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 3. Universities 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 4. Colleges 테이블 생성 (Universities 참조)
    await queryInterface.createTable("Colleges", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      UniversityID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Universities",
          key: "ID",
        },
        onDelete: "CASCADE",
      },
      Name: {
        type: Sequelize.STRING(255),
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
    });

    // 5. Departments 테이블 생성 (Colleges 참조)
    await queryInterface.createTable("Departments", {
      ID: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      CollegeID: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Colleges",
          key: "ID",
        },
        onDelete: "CASCADE",
      },
      Name: {
        type: Sequelize.STRING(255),
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
    });

    // 6. Recruitments 테이블 생성 (Users 참조)
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
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
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
    });

    // 7. Projects 테이블 생성 (Users, Recruitments 참조)
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
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        unique: true,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
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
    });

    // 8. Comments 테이블 생성 (Users, Recruitments 참조)
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
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
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
    });

    // 9. Likes 테이블 생성 (Users, Recruitments 참조)
    await queryInterface.createTable("Likes", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "user_id",
        },
        onDelete: "CASCADE",
      },
      recruitment_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "Recruitments",
          key: "recruitment_id",
        },
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
    });

    // 10. Notifications 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 11. Reviews 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 12. Keywords 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
      },
    });

    // 13. Searches 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
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
    });

    // 14. VerifiedEmails 테이블 생성 (독립적)
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
        defaultValue: Sequelize.NOW,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("DATE_ADD", Sequelize.NOW(), Sequelize.literal("INTERVAL 24 HOUR")),
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("VerifiedEmails");
    await queryInterface.dropTable("Searches");
    await queryInterface.dropTable("Keywords");
    await queryInterface.dropTable("Reviews");
    await queryInterface.dropTable("Notifications");
    await queryInterface.dropTable("Likes");
    await queryInterface.dropTable("Comments");
    await queryInterface.dropTable("Projects");
    await queryInterface.dropTable("Recruitments");
    await queryInterface.dropTable("Departments");
    await queryInterface.dropTable("Colleges");
    await queryInterface.dropTable("Universities");
    await queryInterface.dropTable("Admins");
    await queryInterface.dropTable("Users");
  },
};