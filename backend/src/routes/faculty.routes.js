import express from 'express';
import { 
  getDashboard, 
  getCourses, 
  getAssignments, 
  getGradebook, 
  gradeSubmission, 
  getStudents, 
  getSchedule,
  getCourseById,
  createAssignment,
  getSubmissions,
  markAttendance,
  getAttendance
} from '../controllers/faculty.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All faculty routes require authentication and FACULTY role
router.use(protect);
router.use(authorize('FACULTY'));

// Dashboard
router.get('/dashboard', getDashboard);

// Courses
router.get('/courses', getCourses);
router.get('/courses/:courseId', getCourseById);

// Assignments
router.get('/assignments', getAssignments);
router.post('/assignments', createAssignment);
router.get('/assignments/:assignmentId/submissions', getSubmissions);

// Grading
router.post('/submissions/:submissionId/grade', gradeSubmission);

// Gradebook
router.get('/gradebook/:courseId', getGradebook);

// Students
router.get('/students', getStudents);

// Schedule
router.get('/schedule', getSchedule);

// Attendance
router.post('/attendance', markAttendance);
router.get('/attendance/course/:courseId', getAttendance);

export default router;