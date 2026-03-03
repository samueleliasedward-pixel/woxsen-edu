// backend/src/routes/student.routes.js
import express from 'express';
import {
  getDashboard,
  getCourses,
  getAssignments,
  submitAssignment,
  getExams,
  getTimetable,
  getFiles
} from '../controllers/student.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===== PROTECT ALL STUDENT ROUTES =====
// All routes require authentication and STUDENT role
router.use(protect);
router.use(authorize('STUDENT'));

// ==================== DASHBOARD ====================
// GET /api/student/dashboard - Get student dashboard
router.get('/dashboard', getDashboard);

// ==================== COURSES ====================
// GET /api/student/courses - Get all enrolled courses
router.get('/courses', getCourses);

// ==================== ASSIGNMENTS ====================
// GET /api/student/assignments - Get all assignments
router.get('/assignments', getAssignments);

// POST /api/student/assignments/:id/submit - Submit assignment
router.post('/assignments/:id/submit', submitAssignment);

// ==================== EXAMS ====================
// GET /api/student/exams - Get all exams
router.get('/exams', getExams);

// ==================== TIMETABLE ====================
// GET /api/student/timetable - Get student timetable
router.get('/timetable', getTimetable);

// ==================== FILES ====================
// GET /api/student/files - Get all files for student's courses
router.get('/files', getFiles);

export default router;