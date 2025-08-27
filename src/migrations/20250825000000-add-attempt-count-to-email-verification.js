'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // EmailVerifications 테이블이 존재하는지 확인
    const tableNames = await queryInterface.showAllTables();
    if (!tableNames.includes('EmailVerifications')) {
      console.log('EmailVerifications table does not exist, skipping attempt_count column addition');
      return;
    }

    // attempt_count 컬럼이 이미 존재하는지 확인
    const tableDesc = await queryInterface.describeTable('EmailVerifications');
    if (tableDesc.attempt_count) {
      console.log('attempt_count column already exists, skipping');
      return;
    }

    await queryInterface.addColumn('EmailVerifications', 'attempt_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('EmailVerifications', 'attempt_count');
  }
};
