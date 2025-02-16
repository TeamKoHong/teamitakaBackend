module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Campuses", {
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
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Campuses");
  },
};
