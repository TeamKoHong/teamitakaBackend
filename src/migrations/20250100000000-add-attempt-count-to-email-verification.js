'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('EmailVerifications', 'attempt_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      after: 'ua'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EmailVerifications', 'attempt_count');
  }
};
