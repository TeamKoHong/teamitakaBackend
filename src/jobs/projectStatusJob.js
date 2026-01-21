const { Project } = require('../models');
const { logger } = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Transition expired projects from ACTIVE to COMPLETED status
 * Runs as a scheduled job to automatically update project statuses
 * when their end_date has passed
 *
 * @returns {Promise<Object>} Result object with count and project details
 */
async function transitionExpiredProjects() {
  const startTime = Date.now();

  try {
    // Get current date at midnight (start of day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    logger.info('🔄 프로젝트 상태 전환 작업 시작', {
      current_date: today.toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    });

    // Find and update expired projects in a single query
    // Using Sequelize update with returning option (PostgreSQL)
    const result = await Project.update(
      {
        status: 'COMPLETED',
        updated_at: new Date()
      },
      {
        where: {
          status: 'ACTIVE',
          end_date: {
            [Op.lt]: today,  // end_date < today
            [Op.not]: null   // exclude null dates
          }
        },
        returning: true  // PostgreSQL: returns updated rows
      }
    );

    // Result format: [affectedCount, affectedRows]
    // For MySQL: result = [affectedCount]
    // For PostgreSQL: result = [affectedCount, [affectedRows]]
    const updatedCount = result[0];
    const updatedProjects = result[1] || [];

    const duration = Date.now() - startTime;

    if (updatedCount > 0) {
      logger.info('✅ 프로젝트 상태 전환 완료', {
        전환된_프로젝트_수: updatedCount,
        project_ids: Array.isArray(updatedProjects)
          ? updatedProjects.map(p => p.project_id)
          : [],
        소요시간_ms: duration,
        timestamp: new Date().toISOString()
      });
    } else {
      logger.info('ℹ️ 전환할 프로젝트 없음', {
        전환된_프로젝트_수: 0,
        소요시간_ms: duration,
        timestamp: new Date().toISOString()
      });
    }

    return {
      success: true,
      count: updatedCount,
      projects: Array.isArray(updatedProjects) ? updatedProjects : [],
      duration_ms: duration
    };

  } catch (error) {
    const duration = Date.now() - startTime;

    logger.error('❌ 프로젝트 상태 전환 실패', {
      에러: error.message,
      stack: error.stack,
      소요시간_ms: duration,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
}

module.exports = { transitionExpiredProjects };
