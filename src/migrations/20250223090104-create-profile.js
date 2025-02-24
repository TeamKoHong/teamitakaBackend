module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Profiles", {
      profile_id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.CHAR(36),
        allowNull: false,
        collate: "utf8mb4_bin",  // ✅ Collation 명시
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
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Profiles");
  },
};
