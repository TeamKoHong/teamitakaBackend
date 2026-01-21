const cron = require('node-cron');
const { transitionExpiredProjects } = require('./projectStatusJob');
const { logger } = require('../utils/logger');

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
    logger.info('⏸️ 스케줄 작업 비활성화됨 (CRON_ENABLED=false)');
    return;
  }

  // 테스트 모드: 1분마다 실행 (* * * * *)
  // 프로덕션 모드: 매일 자정 (0 0 * * *)
  const schedule = process.env.CRON_SCHEDULE || '* * * * *';
  const timezone = process.env.TIMEZONE || 'Asia/Seoul';

  // Validate cron expression
  if (!cron.validate(schedule)) {
    logger.error('❌ 유효하지 않은 크론 스케줄', {
      schedule,
      기본값: '* * * * *'
    });
  }

  // 스케줄 작업: 프로젝트 상태 자동 전환
  // 테스트 모드: 1분마다 (* * * * *)
  // 프로덕션 모드: 매일 자정 (0 0 * * *)
  const dailyStatusJob = cron.schedule(
    schedule,
    async () => {
      logger.info('⏰ 스케줄 작업 실행 중', {
        schedule,
        timezone,
        timestamp: new Date().toISOString()
      });

      try {
        const result = await transitionExpiredProjects();

        logger.info('✅ 스케줄 작업 완료', {
          작업: 'projectStatusTransition',
          성공: true,
          전환된_프로젝트_수: result.count,
          소요시간_ms: result.duration_ms
        });
      } catch (error) {
        logger.error('❌ 스케줄 작업 실행 실패', {
          작업: 'projectStatusTransition',
          에러: error.message,
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

  logger.info('🚀 스케줄 작업 초기화 완료', {
    작업_수: scheduledJobs.length,
    작업목록: scheduledJobs.map(j => ({
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
    logger.info('ℹ️ 중지할 스케줄 작업 없음');
    return;
  }

  logger.info('⏹️ 스케줄 작업 중지 중', {
    작업_수: scheduledJobs.length
  });

  scheduledJobs.forEach(({ name, job }) => {
    job.stop();
    logger.info(`⏹️ 스케줄 작업 중지됨: ${name}`);
  });

  scheduledJobs = [];

  logger.info('✅ 모든 스케줄 작업 중지 완료');
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
