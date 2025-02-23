module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Projects", "role", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Projects", "role");
  },
};