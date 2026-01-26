'use strict';

/**
 * Migration: Remove Firebase Phone Auth related column
 *
 * This migration removes the firebase_phone_uid column from the users table
 * as Firebase Phone Auth feature has been removed from the application.
 * SMS OTP verification is now the only phone authentication method.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Check if column exists before removing
    const tableInfo = await queryInterface.describeTable('users');

    if (tableInfo.firebase_phone_uid) {
      await queryInterface.removeColumn('users', 'firebase_phone_uid');
      console.log('✅ Removed firebase_phone_uid column from users table');
    } else {
      console.log('ℹ️ firebase_phone_uid column does not exist, skipping removal');
    }
  },

  async down(queryInterface, Sequelize) {
    // Re-add the column if rollback is needed
    const tableInfo = await queryInterface.describeTable('users');

    if (!tableInfo.firebase_phone_uid) {
      await queryInterface.addColumn('users', 'firebase_phone_uid', {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Firebase Phone Auth UID',
      });
      console.log('✅ Re-added firebase_phone_uid column to users table');
    }
  }
};
