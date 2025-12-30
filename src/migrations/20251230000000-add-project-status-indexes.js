'use strict';

/**
 * Migration: Add indexes for project status auto-transition feature
 * Purpose: Optimize query performance for daily cron job that transitions
 *          expired projects from ACTIVE to COMPLETED status
 *
 * Indexes created:
 * 1. idx_projects_status - Single index on status column
 * 2. idx_projects_end_date - Single index on end_date column
 * 3. idx_projects_status_end_date - Composite index on (status, end_date)
 *
 * Performance impact:
 * - Query: WHERE status = 'ACTIVE' AND end_date < CURRENT_DATE
 * - Expected speedup: 10-100x for large datasets (1000+ projects)
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('⚡ Adding indexes for project status optimization...');

    try {
      // PostgreSQL uses "Projects" (capital P), MySQL might use "projects"
      // The model name is "Projects" so we use that
      const tableName = 'Projects';

      // Index 1: Single index on status for general status-based queries
      await queryInterface.addIndex(tableName, ['status'], {
        name: 'idx_projects_status',
        unique: false
      });
      console.log('✅ Created index: idx_projects_status');

      // Index 2: Single index on end_date for date-based queries
      await queryInterface.addIndex(tableName, ['end_date'], {
        name: 'idx_projects_end_date',
        unique: false
      });
      console.log('✅ Created index: idx_projects_end_date');

      // Index 3: Composite index on (status, end_date) for cron job query optimization
      // This is the most important index for the status transition job
      await queryInterface.addIndex(tableName, ['status', 'end_date'], {
        name: 'idx_projects_status_end_date',
        unique: false
      });
      console.log('✅ Created index: idx_projects_status_end_date');

      console.log('✅ All project status indexes created successfully');
    } catch (error) {
      console.error('❌ Failed to create project status indexes:', error.message);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    console.log('🔄 Removing project status indexes...');

    try {
      const tableName = 'Projects';

      // Remove indexes in reverse order
      await queryInterface.removeIndex(tableName, 'idx_projects_status_end_date');
      console.log('✅ Removed index: idx_projects_status_end_date');

      await queryInterface.removeIndex(tableName, 'idx_projects_end_date');
      console.log('✅ Removed index: idx_projects_end_date');

      await queryInterface.removeIndex(tableName, 'idx_projects_status');
      console.log('✅ Removed index: idx_projects_status');

      console.log('✅ All project status indexes removed successfully');
    } catch (error) {
      console.error('❌ Failed to remove project status indexes:', error.message);
      throw error;
    }
  }
};
