// backend/src/services/email.service.js
import nodemailer from 'nodemailer';
import config from '../config/env.js';
import logger from '../utils/logger.js';

// Create transporter
const createTransporter = () => {
  // Check if email is configured
  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    logger.warn('⚠️ Email service not configured. Using mock email service.');
    return null;
  }

  return nodemailer.createTransport({
    host: config.smtpHost,
    port: parseInt(config.smtpPort) || 587,
    secure: parseInt(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass
    },
    tls: {
      rejectUnauthorized: false // For development
    }
  });
};

const transporter = createTransporter();

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (optional)
 * @returns {Promise<Object>}
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // If email config is not set, just log in development
    if (!transporter) {
      logger.info('📧 [MOCK EMAIL] - Email not sent (SMTP not configured)');
      logger.info(`  To: ${to}`);
      logger.info(`  Subject: ${subject}`);
      logger.info(`  Content: ${html.substring(0, 100)}...`);
      
      // Return mock success
      return { 
        success: true, 
        mock: true,
        messageId: `mock-${Date.now()}` 
      };
    }

    const mailOptions = {
      from: `"Woxsen Edu AI" <${config.emailFrom || config.smtpUser}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for plain text
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`✅ Email sent: ${info.messageId} to ${to}`);
    return { success: true, info, messageId: info.messageId };
  } catch (error) {
    logger.error('❌ Error sending email:', error);
    
    // In development, don't throw - just log and return mock success
    if (config.nodeEnv !== 'production') {
      logger.info('📧 [MOCK EMAIL] - Falling back to mock due to error');
      return { 
        success: true, 
        mock: true, 
        error: error.message,
        messageId: `mock-${Date.now()}` 
      };
    }
    
    throw error;
  }
};

/**
 * Send welcome email to new user
 * @param {Object} user - User object
 * @returns {Promise<Object>}
 */
export const sendWelcomeEmail = async (user) => {
  const subject = '🎓 Welcome to Woxsen Edu AI!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 10px 20px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Woxsen Edu AI!</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>Thank you for joining the Woxsen Edu AI platform. We're excited to have you on board!</p>
          
          <h3>🚀 Getting Started</h3>
          <ul>
            <li>Complete your profile</li>
            <li>Explore your dashboard</li>
            <li>Check your courses and assignments</li>
            <li>Try our AI Assistant for help</li>
          </ul>
          
          <a href="${config.frontendUrl}/dashboard" class="button">Go to Dashboard</a>
          
          <p style="margin-top: 30px;">If you have any questions, feel free to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Woxsen Edu AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ 
    to: user.email, 
    subject, 
    html 
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>}
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.frontendUrl}/reset-password?token=${resetToken}`;
  const subject = '🔐 Password Reset Request - Woxsen Edu AI';
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 10px 20px; background: #f5576c; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        .warning { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 10px; border-radius: 5px; margin-top: 20px; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <h2>Hello ${user.name}!</h2>
          <p>We received a request to reset your password for your Woxsen Edu AI account.</p>
          
          <p>Click the button below to reset your password. This link will expire in <strong>1 hour</strong>.</p>
          
          <a href="${resetUrl}" class="button">Reset Password</a>
          
          <div class="warning">
            <p><strong>⚠️ Didn't request this?</strong></p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you're concerned.</p>
          </div>
          
          <p style="margin-top: 30px;">For security reasons, never share this link with anyone.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Woxsen Edu AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ 
    to: user.email, 
    subject, 
    html 
  });
};

/**
 * Send assignment reminder email
 * @param {Object} student - Student object
 * @param {Object} assignment - Assignment object
 * @param {Object} course - Course object
 * @returns {Promise<Object>}
 */
export const sendAssignmentReminderEmail = async (student, assignment, course) => {
  const subject = `⏰ Reminder: ${assignment.title} due tomorrow`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .deadline { background: #fff3cd; border: 1px solid #ffeeba; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; padding: 10px 20px; background: #ff9a9e; color: white; text-decoration: none; border-radius: 5px; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Assignment Reminder</h1>
        </div>
        <div class="content">
          <h2>Hello ${student.name}!</h2>
          
          <div class="deadline">
            <h3>📚 Assignment Due Tomorrow</h3>
            <p><strong>Course:</strong> ${course.name}</p>
            <p><strong>Assignment:</strong> ${assignment.title}</p>
            <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
            <p><strong>Total Points:</strong> ${assignment.totalPoints}</p>
          </div>
          
          <p>This is a friendly reminder that the above assignment is due tomorrow. Make sure to submit your work before the deadline!</p>
          
          <a href="${config.frontendUrl}/assignments/${assignment.id}" class="button">View Assignment</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Woxsen Edu AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ 
    to: student.email, 
    subject, 
    html 
  });
};

/**
 * Send grade notification email
 * @param {Object} student - Student object
 * @param {Object} assignment - Assignment object
 * @param {Object} grade - Grade object
 * @returns {Promise<Object>}
 */
export const sendGradeNotificationEmail = async (student, assignment, grade) => {
  const subject = `📝 Your assignment "${assignment.title}" has been graded`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .grade-box { background: white; border: 2px solid #84fab0; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; }
        .grade { font-size: 48px; font-weight: bold; color: #84fab0; }
        .footer { margin-top: 20px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Assignment Graded</h1>
        </div>
        <div class="content">
          <h2>Hello ${student.name}!</h2>
          
          <p>Your submission for "${assignment.title}" has been graded.</p>
          
          <div class="grade-box">
            <p><strong>Your Score:</strong></p>
            <div class="grade">${grade.score}/${assignment.totalPoints}</div>
            <p>${Math.round((grade.score/assignment.totalPoints)*100)}%</p>
          </div>
          
          ${grade.feedback ? `
            <div style="margin-top: 20px; padding: 15px; background: #f0f0f0; border-radius: 5px;">
              <p><strong>Feedback:</strong></p>
              <p>${grade.feedback}</p>
            </div>
          ` : ''}
          
          <a href="${config.frontendUrl}/assignments/${assignment.id}" class="button" style="background: #84fab0; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px;">View Feedback</a>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Woxsen Edu AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ 
    to: student.email, 
    subject, 
    html 
  });
};

/**
 * Verify email configuration
 * @returns {Promise<boolean>}
 */
export const verifyEmailConfig = async () => {
  if (!transporter) {
    logger.warn('Email service not configured');
    return false;
  }

  try {
    await transporter.verify();
    logger.info('✅ Email service verified successfully');
    return true;
  } catch (error) {
    logger.error('❌ Email service verification failed:', error);
    return false;
  }
};

// Export all functions
export default {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAssignmentReminderEmail,
  sendGradeNotificationEmail,
  verifyEmailConfig
};