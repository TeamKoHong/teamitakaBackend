"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // 1. Universities
      await queryInterface.createTable(
        "Universities",
        {
          ID: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          Name: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          Country: { type: Sequelize.STRING(100), allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 2. Colleges (CampusID 제거, university_id 추가)
      await queryInterface.createTable(
        "Colleges",
        {
          ID: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          university_id: {  // UniversityID 대신 university_id 컬럼 추가
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "Universities", key: "ID" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          Name: { type: Sequelize.STRING(255), allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 3. Departments
      await queryInterface.createTable(
        "Departments",
        {
          ID: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          CollegeID: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: { model: "Colleges", key: "ID" },
            onDelete: "CASCADE",
            onUpdate: "CASCADE",
          },
          Name: { type: Sequelize.STRING(255), allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 4. Admins
      await queryInterface.createTable(
        "Admins",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          password: { type: Sequelize.STRING(255), allowNull: false },
          role: { type: Sequelize.ENUM("ADMIN", "MEMBER"), defaultValue: "ADMIN" },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 5. Users
      await queryInterface.createTable(
        "Users",
        {
          user_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          username: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          password: { type: Sequelize.STRING(255), allowNull: false },
          profileImageUrl: { type: Sequelize.STRING(255), allowNull: true },
          userType: { type: Sequelize.ENUM("ADMIN", "MEMBER"), defaultValue: "MEMBER" },
          role: { type: Sequelize.ENUM("ADMIN", "MEMBER"), defaultValue: "MEMBER" },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 6. VerifiedEmails
      await queryInterface.createTable(
        "VerifiedEmails",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          email: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          certified_date: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          expires_at: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 7. Keywords
      await queryInterface.createTable(
        "Keywords",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          keyword: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          count: { type: Sequelize.INTEGER, defaultValue: 0 },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 8. Searches
      await queryInterface.createTable(
        "Searches",
        {
          id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          user_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: { model: "Users", key: "user_id" },
            onDelete: "SET NULL",
          },
          keyword: { type: Sequelize.STRING(255), allowNull: false },
          searchTime: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 9. Recruitments
      await queryInterface.createTable(
        "Recruitments",
        {
          recruitment_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          title: { type: Sequelize.STRING(255), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: false },
          status: { type: Sequelize.ENUM("OPEN", "CLOSED"), defaultValue: "OPEN" },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          photo: { type: Sequelize.STRING(255), allowNull: true },
          views: { type: Sequelize.INTEGER, defaultValue: 0, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 10. Projects
      await queryInterface.createTable(
        "Projects",
        {
          project_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          title: { type: Sequelize.STRING(255), allowNull: false, defaultValue: "Default Project" },
          description: { type: Sequelize.TEXT, allowNull: false, defaultValue: "Default Description" },
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
          start_date: { type: Sequelize.DATE, allowNull: true },
          end_date: { type: Sequelize.DATE, allowNull: true },
          status: { type: Sequelize.ENUM("예정", "진행 중", "완료"), defaultValue: "예정", allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 11. Applications
      await queryInterface.createTable(
        "Applications",
        {
          application_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          status: { type: Sequelize.ENUM("PENDING", "APPROVED", "REJECTED"), defaultValue: "PENDING", allowNull: false },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
          },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 12. Comments
      await queryInterface.createTable(
        "Comments",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          content: { type: Sequelize.TEXT, allowNull: false },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
          },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 13. Likes
      await queryInterface.createTable(
        "Likes",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          recruitment_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Recruitments", key: "recruitment_id" },
            onDelete: "CASCADE",
          },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 14. Notifications
      await queryInterface.createTable(
        "Notifications",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          message: { type: Sequelize.TEXT, allowNull: false },
          isRead: { type: Sequelize.BOOLEAN, defaultValue: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 15. Profiles
      await queryInterface.createTable(
        "Profiles",
        {
          profile_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: true,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          nickname: { type: Sequelize.STRING(255), allowNull: false },
          profileImageUrl: { type: Sequelize.STRING(255), allowNull: true },
          university: { type: Sequelize.STRING(255), allowNull: true },
          major: { type: Sequelize.STRING(255), allowNull: true },
          avatar: { type: Sequelize.STRING(255), allowNull: true },
          bio: { type: Sequelize.TEXT, allowNull: true },
          awards: { type: Sequelize.TEXT, allowNull: true },
          skills: { type: Sequelize.TEXT, allowNull: true },
          portfolio_url: { type: Sequelize.STRING(255), allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 16. Reviews
      await queryInterface.createTable(
        "Reviews",
        {
          review_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          reviewer_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          reviewee_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          role_description: { type: Sequelize.TEXT, allowNull: true },
          ability: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          effort: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          commitment: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          communication: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          reflection: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          overall_rating: { type: Sequelize.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
          comment: { type: Sequelize.TEXT, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 17. Hashtags
      await queryInterface.createTable(
        "Hashtags",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          content: { type: Sequelize.STRING(255), allowNull: false, unique: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 18. Todos
      await queryInterface.createTable(
        "Todos",
        {
          todo_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          task: { type: Sequelize.STRING(255), allowNull: false },
          completed: { type: Sequelize.BOOLEAN, defaultValue: false },
          due_date: { type: Sequelize.DATE, allowNull: true },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 19. ProjectMembers
      await queryInterface.createTable(
        "ProjectMembers",
        {
          id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          role: { type: Sequelize.ENUM("팀장", "팀원"), defaultValue: "팀원", allowNull: false },
          joined_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          status: { type: Sequelize.ENUM("활성", "비활성"), defaultValue: "활성", allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 20. Timelines
      await queryInterface.createTable(
        "Timelines",
        {
          timeline_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          event_title: { type: Sequelize.STRING(255), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 21. ProjectPosts
      await queryInterface.createTable(
        "ProjectPosts",
        {
          post_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          content: { type: Sequelize.TEXT, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 22. Votes
      await queryInterface.createTable(
        "Votes",
        {
          vote_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          title: { type: Sequelize.STRING(255), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          start_date: { type: Sequelize.DATE, allowNull: false },
          end_date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 23. VoteOptions
      await queryInterface.createTable(
        "VoteOptions",
        {
          option_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          vote_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Votes", key: "vote_id" },
            onDelete: "CASCADE",
          },
          option_text: { type: Sequelize.STRING(255), allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 24. VoteResponses
      await queryInterface.createTable(
        "VoteResponses",
        {
          response_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          vote_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Votes", key: "vote_id" },
            onDelete: "CASCADE",
          },
          option_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "VoteOptions", key: "option_id" },
            onDelete: "CASCADE",
          },
          user_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Users", key: "user_id" },
            onDelete: "CASCADE",
          },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );

      // 25. Schedules
      await queryInterface.createTable(
        "Schedules",
        {
          schedule_id: { type: Sequelize.UUID, defaultValue: Sequelize.UUIDV4, primaryKey: true },
          project_id: {
            type: Sequelize.UUID,
            allowNull: false,
            references: { model: "Projects", key: "project_id" },
            onDelete: "CASCADE",
          },
          title: { type: Sequelize.STRING(255), allowNull: false },
          description: { type: Sequelize.TEXT, allowNull: true },
          date: { type: Sequelize.DATE, allowNull: false },
          createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
          updatedAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
        },
        { charset: "utf8mb4", collate: "utf8mb4_bin", transaction }
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable("Schedules", { transaction });
      await queryInterface.dropTable("VoteResponses", { transaction });
      await queryInterface.dropTable("VoteOptions", { transaction });
      await queryInterface.dropTable("Votes", { transaction });
      await queryInterface.dropTable("ProjectPosts", { transaction });
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
      await queryInterface.dropTable("Universities", { transaction });
    });
  },
};