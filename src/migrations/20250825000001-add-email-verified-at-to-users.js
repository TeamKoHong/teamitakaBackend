'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Users 테이블이 존재하는지 확인
    const tableNames = await queryInterface.showAllTables();
    if (!tableNames.includes('Users')) {
      console.log('Users table does not exist, skipping email_verified_at column addition');
      return;
    }

    // email_verified_at 컬럼이 이미 존재하는지 확인
    const tableDesc = await queryInterface.describeTable('Users');
    if (tableDesc.email_verified_at) {
      console.log('email_verified_at column already exists, skipping');
      return;
    }

    await queryInterface.addColumn('Users', 'email_verified_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'email_verified_at');
  }
};
