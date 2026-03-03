// backend/src/jobs/reminder.job.js
import cron from 'node-cron';
import { sendAssignmentReminders } from '../services/reminder.service.js';
import logger from '../utils/logger.js';

// Run every day at 8 AM
export function initReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    logger.info('Running reminder job...');
    try {
      const count = await sendAssignmentReminders();
      logger.info(`Reminder job completed. Sent ${count} reminders.`);
    } catch (error) {
      logger.error('Reminder job failed:', error);
    }
  });
  logger.info('Reminder job scheduled');
}

// Run every hour
export function initNotificationJob() {
  cron.schedule('0 * * * *', async () => {
    logger.info('Running notification check...');
    try {
      logger.info('Notification check completed');
    } catch (error) {
      logger.error('Notification check failed:', error);
    }
  });
  logger.info('Notification job scheduled');
}