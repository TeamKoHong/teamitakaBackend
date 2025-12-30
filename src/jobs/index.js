const cron = require('node-cron');
const { transitionExpiredProjects } = require('./projectStatusJob');
const logger = require('../utils/logger');

// Store scheduled job instances for graceful shutdown
let scheduledJobs = [];

/**
 * Initialize all scheduled jobs
 * Called on server startup to begin cron job execution
 */
function initializeScheduledJobs() {
  // Check if cron is enabled via environment variable
  const cronEnabled = process.env.CRON_ENABLED !== 'false';

  if (!cronEnabled) {
    logger.info('Scheduled jobs disabled via CRON_ENABLED environment variable');
    return;
  }

  const schedule = process.env.CRON_SCHEDULE || '0 0 * * *';
  const timezone = process.env.TIMEZONE || 'Asia/Seoul';

  // Validate cron expression
  if (!cron.validate(schedule)) {
    logger.error('Invalid cron schedule expression', {
      schedule,
      defaulting_to: '0 0 * * *'
    });
  }

  // Schedule: Daily project status transition job
  // Default: Every day at midnight (00:00) Asia/Seoul time
  // Cron expression format: 'minute hour day-of-month month day-of-week'
  // '0 0 * * *' means: At 00:00 (midnight) every day
  const dailyStatusJob = cron.schedule(
    schedule,
    async () => {
      logger.info('Running scheduled project status transition job', {
        schedule,
        timezone,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await transitionExpiredProjects();

        logger.info('Scheduled job completed', {
          job: 'projectStatusTransition',
          success: true,
          transitioned_count: result.count,
          duration_ms: result.duration_ms
        });
      } catch (error) {
        logger.error('Scheduled job execution failed', {
          job: 'projectStatusTransition',
          error: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        });
      }
    },
    {
      scheduled: true,
      timezone: timezone
    }
  );

  scheduledJobs.push({
    name: 'projectStatusTransition',
    job: dailyStatusJob,
    schedule,
    timezone
  });

  logger.info('Scheduled jobs initialized successfully', {
    count: scheduledJobs.length,
    jobs: scheduledJobs.map(j => ({
      name: j.name,
      schedule: j.schedule,
      timezone: j.timezone
    })),
    timestamp: new Date().toISOString()
  });
}

/**
 * Stop all scheduled jobs gracefully
 * Called during server shutdown to prevent job execution during restart
 */
function stopScheduledJobs() {
  if (scheduledJobs.length === 0) {
    logger.info('No scheduled jobs to stop');
    return;
  }

  logger.info('Stopping scheduled jobs', {
    count: scheduledJobs.length
  });

  scheduledJobs.forEach(({ name, job }) => {
    job.stop();
    logger.info(`Stopped scheduled job: ${name}`);
  });

  scheduledJobs = [];

  logger.info('All scheduled jobs stopped successfully');
}

/**
 * Get status of all scheduled jobs
 * Useful for health checks and monitoring
 *
 * @returns {Array<Object>} List of job statuses
 */
function getScheduledJobsStatus() {
  return scheduledJobs.map(({ name, schedule, timezone }) => ({
    name,
    schedule,
    timezone,
    running: true
  }));
}

module.exports = {
  initializeScheduledJobs,
  stopScheduledJobs,
  getScheduledJobsStatus
};
