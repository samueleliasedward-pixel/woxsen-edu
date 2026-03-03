// backend/src/services/reminder.service.js
console.log('🔄 Loading reminder.service.js...');

import prisma from '../config/db.js';
console.log('✅ prisma imported');

import logger from '../utils/logger.js';
console.log('✅ logger imported');

import { sendEmail } from './email.service.js';
console.log('✅ sendEmail imported');

export const sendAssignmentReminders = async () => {
  console.log('📧 sendAssignmentReminders called');
  try {
    logger.info('Fetching upcoming assignments for reminders...');
    
    // Get assignments due in the next 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const assignments = await prisma.assignment.findMany({
      where: {
        dueDate: {
          gte: now,
          lte: tomorrow
        },
        status: 'ACTIVE'
      },
      include: {
        course: {
          include: {
            enrollments: {
              include: {
                student: {
                  include: {
                    user: true
                  }
                }
              }
            }
          }
        }
      }
    });

    logger.info(`Found ${assignments.length} assignments due tomorrow`);

    let reminderCount = 0;

    // Send reminders for each assignment
    for (const assignment of assignments) {
      for (const enrollment of assignment.course.enrollments) {
        const student = enrollment.student.user;
        
        // Check if already submitted
        const submission = await prisma.submission.findFirst({
          where: {
            assignmentId: assignment.id,
            studentId: enrollment.studentId
          }
        });

        // Only send reminder if not submitted
        if (!submission) {
          await sendEmail({
            to: student.email,
            subject: `Reminder: ${assignment.title} due tomorrow`,
            html: `
              <h2>Assignment Reminder</h2>
              <p>Hello ${student.name},</p>
              <p>This is a reminder that the following assignment is due tomorrow:</p>
              <ul>
                <li><strong>Course:</strong> ${assignment.course.name}</li>
                <li><strong>Assignment:</strong> ${assignment.title}</li>
                <li><strong>Due Date:</strong> ${assignment.dueDate.toLocaleDateString()}</li>
              </ul>
              <p>Please submit your work before the deadline.</p>
            `
          });

          // Create notification in database
          await prisma.notification.create({
            data: {
              userId: student.id,
              type: 'ASSIGNMENT_REMINDER',
              title: 'Assignment Due Tomorrow',
              message: `${assignment.title} for ${assignment.course.name} is due tomorrow`,
              data: {
                assignmentId: assignment.id,
                courseId: assignment.course.id
              }
            }
          });

          reminderCount++;
        }
      }
    }

    logger.info(`Sent ${reminderCount} assignment reminders`);
    return reminderCount;

  } catch (error) {
    logger.error('Error sending assignment reminders:', error);
    throw error;
  }
};

export const sendCustomNotification = async (userId, title, message, type = 'SYSTEM', data = {}) => {
  console.log('📢 sendCustomNotification called');
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data
      }
    });

    // Here you could also send real-time notification via WebSocket
    logger.info(`Notification created for user ${userId}: ${title}`);

    return notification;
  } catch (error) {
    logger.error('Error sending notification:', error);
    throw error;
  }
};

export const sendBulkNotifications = async (userIds, title, message, type = 'SYSTEM', data = {}) => {
  console.log('📢 sendBulkNotifications called');
  try {
    const notifications = await prisma.notification.createMany({
      data: userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        data
      }))
    });

    logger.info(`Sent ${notifications.count} bulk notifications`);
    return notifications;
  } catch (error) {
    logger.error('Error sending bulk notifications:', error);
    throw error;
  }
};

console.log('✅ reminder.service.js loaded successfully');