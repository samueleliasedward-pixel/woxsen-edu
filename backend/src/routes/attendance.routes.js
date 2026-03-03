import express from 'express';
import {
  markAttendance,
  markBulkAttendance,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceAnalytics
} from '../controllers/attendance.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All attendance routes require authentication
router.use(protect);

// Faculty/Admin routes
router.post('/mark', authorize('FACULTY', 'ADMIN'), markAttendance);
router.post('/bulk', authorize('FACULTY', 'ADMIN'), markBulkAttendance);
router.get('/course/:courseId', authorize('FACULTY', 'ADMIN'), getCourseAttendance);
router.get('/analytics', authorize('FACULTY', 'ADMIN'), getAttendanceAnalytics);

// Student routes (students can view their own attendance)
router.get('/student/:studentId', authorize('STUDENT', 'FACULTY', 'ADMIN'), getStudentAttendance);

export default router;