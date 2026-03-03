import nodemailer from 'nodemailer'; 
import config from '../config/env.js'; 
import logger from '../utils/logger.js'; 
 
const transporter = nodemailer.createTransport({ 
  host: config.email.host, 
  port: config.email.port, 
  secure: false, 
  auth: { 
    user: config.email.user, 
    pass: config.email.pass 
  } 
}); 
 
export const sendEmail = async ({ to, subject, template, data }) => { 
  try { 
    // Simple template rendering - in production, use a proper template engine 
    let html = getTemplate(template, data); 
 
    const mailOptions = { 
      from: config.email.from, 
      to, 
      subject, 
      html 
    }; 
 
    const info = await transporter.sendMail(mailOptions); 
    logger.info(`Email sent: ${info.messageId}`); 
    return info; 
  } catch (error) { 
    logger.error('Email sending failed:', error); 
    throw error; 
  } 
}; 
 
export const sendWelcomeEmail = async (user) => { 
  return sendEmail({ 
    to: user.email, 
    subject: 'Welcome to Woxsen EDU AI Platform', 
    template: 'welcome', 
    data: { name: user.name } 
  }); 
}; 
 
export const sendAssignmentReminder = async (user, assignment) => { 
  return sendEmail({ 
    to: user.email, 
    subject: `Assignment Reminder: ${assignment.title}`, 
    template: 'assignment-reminder', 
    data: { 
      name: user.name, 
      assignment: assignment.title, 
      dueDate: assignment.dueDate.toLocaleDateString(), 
      course: assignment.course.name 
    } 
  }); 
}; 
 
export const sendGradeNotification = async (user, grade) => { 
  return sendEmail({ 
    to: user.email, 
    subject: `New Grade: ${grade.submission.assignment.title}`, 
    template: 'grade-notification', 
    data: { 
      name: user.name, 
      assignment: grade.submission.assignment.title, 
      score: grade.score, 
      total: grade.maxScore, 
      percentage: grade.percentage, 
      course: grade.submission.assignment.course.name 
    } 
  }); 
}; 
 
// Simple template functions 
function getTemplate(name, data) { 
  const templates = { 
    welcome: ` 
      <h1>Welcome to Woxsen EDU AI Platform!</h1> 
      <p>Dear ${data.name},</p> 
      <p>Thank you for joining Woxsen University's AI-powered education 
platform.</p> 
      <p>You can now access your courses, assignments, and AI assistant.</p> 
      <p><a href="${config.frontendUrl}/login">Login to your account</a></p> 
    `, 
    'assignment-reminder': ` 
      <h1>Assignment Reminder</h1> 
      <p>Dear ${data.name},</p> 
      <p>This is a reminder that assignment "${data.assignment}" for ${data.course} is 
due on ${data.dueDate}.</p> 
      <p><a href="${config.frontendUrl}/student/assignments">View 
Assignment</a></p> 
    `, 
    'grade-notification': ` 
      <h1>New Grade Posted</h1> 
      <p>Dear ${data.name},</p> 
      <p>Your grade for "${data.assignment}" has been posted.</p> 
      <p>Score: ${data.score}/${data.total} (${data.percentage}%)</p> 
      <p><a href="${config.frontendUrl}/student/assignments">View Details</a></p> 
    ` 
  }; 
 
  return templates[name] || '<p>Email template not found</p>'; 
} 
 
 