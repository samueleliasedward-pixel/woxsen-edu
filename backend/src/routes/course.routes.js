import express from 'express';
import { 
  createCourse, 
  getCourses, 
  getCourseById,
  updateCourse, 
  deleteCourse,
  archiveCourse,
  getCourseStats,
  getAvailableCourses,
  enrollInCourse
} from '../controllers/course.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Student routes - MUST come BEFORE /:id
router.get('/available', authorize('STUDENT'), getAvailableCourses);
router.post('/:id/enroll', authorize('STUDENT'), enrollInCourse);

// Faculty routes
router.post('/', authorize('FACULTY'), createCourse);
router.get('/', authorize('FACULTY'), getCourses);
router.get('/stats', authorize('FACULTY'), getCourseStats);
router.put('/:id', authorize('FACULTY'), updateCourse);
router.patch('/:id/archive', authorize('FACULTY'), archiveCourse);
router.delete('/:id', authorize('FACULTY'), deleteCourse);

// Shared routes (accessible by both faculty and students)
router.get('/:id', authorize('FACULTY', 'STUDENT'), getCourseById);

export default router;