'use strict';

/**
 * Migration: Add mbti_type column to users table
 * 성향 테스트 결과 저장용 (예: 'LION', '활동티미')
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('🚀 [Migration] Adding mbti_type column to users table...');

    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.mbti_type) {
      await queryInterface.addColumn('users', 'mbti_type', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'MBTI 유형 결과 (예: LION, 활동티미)'
      });
      console.log('✅ [Migration] mbti_type column added successfully');
    } else {
      console.log('ℹ️ [Migration] mbti_type column already exists, skipping...');
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 [Migration] Removing mbti_type column from users table...');

    const tableDescription = await queryInterface.describeTable('users');

    if (tableDescription.mbti_type) {
      await queryInterface.removeColumn('users', 'mbti_type');
      console.log('✅ [Migration] mbti_type column removed successfully');
    } else {
      console.log('ℹ️ [Migration] mbti_type column does not exist, skipping...');
    }
  }
};
