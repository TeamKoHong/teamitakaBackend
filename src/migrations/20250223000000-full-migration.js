"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Universities (No foreign key dependencies)
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 2. Campuses (References Universities)
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
            onUpdate: "CASCADE",
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 3. Colleges (References Campuses)
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
            onUpdate: "CASCADE",
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 4. Departments (References Colleges)
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
            onUpdate: "CASCADE",
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 5. Admins (No foreign key dependencies)
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 6. Users (No foreign key dependencies initially)
      await queryInterface.createTable(
        "Users",
        {
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
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
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 7. VerifiedEmails (No foreign key dependencies)
      await queryInterface.createTable(
        "VerifiedEmails",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          email: {
            type: Sequelize.STRING(255),
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 8. Keywords (No foreign key dependencies)
      await queryInterface.createTable(
        "Keywords",
        {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          keyword: {
            type: Sequelize.STRING(255),
            allowNull: false,
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 9. Searches (References Users)
      await queryInterface.createTable(
        "Searches",
        {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: true,
            references: { model: "Users", key: "user_id" },
            onDelete: "SET NULL",
          },
          keyword: {
            type: Sequelize.STRING(255),
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 10. Recruitments (References Users)
      await queryInterface.createTable(
        "Recruitments",
        {
          recruitment_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          title: {
            type: Sequelize.STRING(255),
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
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          photo: {
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 11. Projects (References Users and Recruitments)
      await queryInterface.createTable(
        "Projects",
        {
          project_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          title: {
            type: Sequelize.STRING(255),
            allowNull: false,
            defaultValue: "Default Project",
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: false,
            defaultValue: "Default Description",
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.CHAR(36).BINARY,
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
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 12. Applications (References Users and Recruitments)
      await queryInterface.createTable(
        "Applications",
        {
          application_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          status: {
            type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"),
            defaultValue: "PENDING",
            allowNull: false,
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 13. Comments (References Users and Recruitments)
      await queryInterface.createTable(
        "Comments",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          content: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 14. Likes (References Users and Recruitments)
      await queryInterface.createTable(
        "Likes",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 15. Notifications (References Users)
      await queryInterface.createTable(
        "Notifications",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 16. Profiles (References Users)
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
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          nickname: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          profileImageUrl: {
            type: Sequelize.STRING(255),
            allowNull: true,
          },
          university: {
            type: Sequelize.STRING(255),
          },
          major1: {
            type: Sequelize.STRING(255),
          },
          major2: {
            type: Sequelize.STRING(255),
          },
          skills: {
            type: Sequelize.STRING(255),
          },
          link: {
            type: Sequelize.STRING(255),
          },
          awards: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          ability_graph: {
            type: Sequelize.JSON,
          },
          strengths: {
            type: Sequelize.TEXT,
          },
          weaknesses: {
            type: Sequelize.TEXT,
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 17. Reviews (References Users and Projects)
      await queryInterface.createTable(
        "Reviews",
        {
          review_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          project_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          reviewer_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          reviewee_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 18. Hashtags (No foreign key dependencies)
      await queryInterface.createTable(
        "Hashtags",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          content: {
            type: Sequelize.STRING(255),
            allowNull: false,
            unique: true,
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 19. Todos (References Projects)
      await queryInterface.createTable(
        "Todos",
        {
          todo_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          project_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          task: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          completed: {
            type: Sequelize.BOOLEAN,
            defaultValue: false,
          },
          due_date: {
            type: Sequelize.DATE,
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 20. ProjectMembers (References Projects and Users)
      await queryInterface.createTable(
        "ProjectMembers",
        {
          id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          project_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          user_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          role: {
            type: Sequelize.ENUM("팀장", "팀원"),
            defaultValue: "팀원",
            allowNull: false,
          },
          joined_at: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          },
          status: {
            type: Sequelize.ENUM("활성", "비활성"),
            defaultValue: "활성",
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
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 21. Timelines (References Projects)
      await queryInterface.createTable(
        "Timelines",
        {
          timeline_id: {
            type: Sequelize.CHAR(36).BINARY,
            defaultValue: Sequelize.UUIDV4,
            primaryKey: true,
          },
          project_id: {
            type: Sequelize.CHAR(36).BINARY,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          event_title: {
            type: Sequelize.STRING(255),
            allowNull: false,
          },
          description: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          date: {
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
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // Adding foreign key constraints explicitly (if not already handled inline)
      await queryInterface.addConstraint(
        "Recruitments",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_recruitments_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Applications",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_applications_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Applications",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_applications_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projects_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Projects",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_projects_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Comments",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_comments_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Comments",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_comments_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Likes",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_likes_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Likes",
        {
          fields: ["recruitment_id"],
          type: "foreign key",
          name: "fk_likes_recruitment_id",
          references: { table: "Recruitments", field: "recruitment_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Notifications",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_notifications_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Profiles",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_profiles_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Reviews",
        {
          fields: ["project_id"],
          type: "foreign key",
          name: "fk_reviews_project_id",
          references: { table: "Projects", field: "project_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Reviews",
        {
          fields: ["reviewer_id"],
          type: "foreign key",
          name: "fk_reviews_reviewer_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Reviews",
        {
          fields: ["reviewee_id"],
          type: "foreign key",
          name: "fk_reviews_reviewee_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Todos",
        {
          fields: ["project_id"],
          type: "foreign key",
          name: "fk_todos_project_id",
          references: { table: "Projects", field: "project_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "ProjectMembers",
        {
          fields: ["project_id"],
          type: "foreign key",
          name: "fk_projectmembers_project_id",
          references: { table: "Projects", field: "project_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "ProjectMembers",
        {
          fields: ["user_id"],
          type: "foreign key",
          name: "fk_projectmembers_user_id",
          references: { table: "Users", field: "user_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        "Timelines",
        {
          fields: ["project_id"],
          type: "foreign key",
          name: "fk_timelines_project_id",
          references: { table: "Projects", field: "project_id" },
          onDelete: "CASCADE",
        },
        { transaction }
      );
    });
  },

  async down(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Remove constraints first
      await queryInterface.removeConstraint("Timelines", "fk_timelines_project_id", { transaction });
      await queryInterface.removeConstraint("ProjectMembers", "fk_projectmembers_user_id", { transaction });
      await queryInterface.removeConstraint("ProjectMembers", "fk_projectmembers_project_id", { transaction });
      await queryInterface.removeConstraint("Todos", "fk_todos_project_id", { transaction });
      await queryInterface.removeConstraint("Reviews", "fk_reviews_reviewee_id", { transaction });
      await queryInterface.removeConstraint("Reviews", "fk_reviews_reviewer_id", { transaction });
      await queryInterface.removeConstraint("Reviews", "fk_reviews_project_id", { transaction });
      await queryInterface.removeConstraint("Profiles", "fk_profiles_user_id", { transaction });
      await queryInterface.removeConstraint("Notifications", "fk_notifications_user_id", { transaction });
      await queryInterface.removeConstraint("Likes", "fk_likes_recruitment_id", { transaction });
      await queryInterface.removeConstraint("Likes", "fk_likes_user_id", { transaction });
      await queryInterface.removeConstraint("Comments", "fk_comments_recruitment_id", { transaction });
      await queryInterface.removeConstraint("Comments", "fk_comments_user_id", { transaction });
      await queryInterface.removeConstraint("Projects", "fk_projects_recruitment_id", { transaction });
      await queryInterface.removeConstraint("Projects", "fk_projects_user_id", { transaction });
      await queryInterface.removeConstraint("Applications", "fk_applications_recruitment_id", { transaction });
      await queryInterface.removeConstraint("Applications", "fk_applications_user_id", { transaction });
      await queryInterface.removeConstraint("Recruitments", "fk_recruitments_user_id", { transaction });
      await queryInterface.removeConstraint("Searches", "Searches_user_id_fkey", { transaction });
      await queryInterface.removeConstraint("Departments", "Departments_CollegeID_fkey", { transaction });
      await queryInterface.removeConstraint("Colleges", "Colleges_CampusID_fkey", { transaction });
      await queryInterface.removeConstraint("Campuses", "Campuses_UniversityID_fkey", { transaction });

      // Drop tables in reverse order
      await queryInterface.dropTable("Timelines", { transaction });
      await queryInterface.dropTable("ProjectMembers", { transaction });
      await queryInterface.dropTable("Todos", { transaction });
      await queryInterface.dropTable("Hashtags", { transaction });
      await queryInterface.dropTable("Reviews", { transaction });
      await queryInterface.dropTable("Profiles", { transaction });
      await queryInterface.dropTable("Notifications", { transaction });
      await queryInterface.dropTable("Likes", { transaction });
      await queryInterface.dropTable("Comments", { transaction });
      await queryInterface.dropTable("Applications", { transaction });
      await queryInterface.dropTable("Projects", { transaction });
      await queryInterface.dropTable("Recruitments", { transaction });
      await queryInterface.dropTable("Searches", { transaction });
      await queryInterface.dropTable("Keywords", { transaction });
      await queryInterface.dropTable("VerifiedEmails", { transaction });
      await queryInterface.dropTable("Users", { transaction });
      await queryInterface.dropTable("Admins", { transaction });
      await queryInterface.dropTable("Departments", { transaction });
      await queryInterface.dropTable("Colleges", { transaction });
      await queryInterface.dropTable("Campuses", { transaction });
      await queryInterface.dropTable("Universities", { transaction });
    });
  },
};