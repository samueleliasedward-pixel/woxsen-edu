// backend/src/routes/admin.routes.js
import express from 'express';
import { protect, authorize } from '../middleware/auth.middleware.js';

// Import all admin controller functions
import {
  // Dashboard
  getDashboardStats,
  
  // Student Management
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  toggleStudentStatus,
  importStudents,
  exportStudents,
  
  // Faculty Management
  getFaculty,
  getFacultyById,
  createFaculty,
  updateFaculty,
  deleteFaculty,
  toggleFacultyStatus,
  
  // Course Management
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  
  // AI Monitoring
  getAIMonitoring,
  getAIAnalytics,
  getAIStats,
  
  // System Logs
  getSystemLogs,
  getLogById,
  exportLogs
  
} from '../controllers/admin.controller.js';

const router = express.Router();

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// All routes below require authentication and admin role
// ============================================================================
router.use(protect);
router.use(authorize('ADMIN', 'SUPER_ADMIN'));

// ============================================================================
// DASHBOARD ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard statistics
 * @access  Private/Admin
 */
router.get('/dashboard', getDashboardStats);

// ============================================================================
// STUDENT MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/students
 * @desc    Get all students with optional pagination and filters
 * @access  Private/Admin
 * @query   {string} search - Search by name, email, or student ID
 * @query   {string} status - Filter by status (active/inactive/all)
 * @query   {number} page - Page number for pagination
 * @query   {number} limit - Items per page
 */
router.get('/students', getStudents);

/**
 * @route   GET /api/admin/students/:id
 * @desc    Get student details by ID
 * @access  Private/Admin
 */
router.get('/students/:id', getStudentById);

/**
 * @route   POST /api/admin/students
 * @desc    Create a new student
 * @access  Private/Admin
 */
router.post('/students', createStudent);

/**
 * @route   PUT /api/admin/students/:id
 * @desc    Update student information
 * @access  Private/Admin
 */
router.put('/students/:id', updateStudent);

/**
 * @route   DELETE /api/admin/students/:id
 * @desc    Delete a student (permanent)
 * @access  Private/Admin
 */
router.delete('/students/:id', deleteStudent);

/**
 * @route   PATCH /api/admin/students/:id/toggle-status
 * @desc    Activate or suspend a student account
 * @access  Private/Admin
 */
router.patch('/students/:id/toggle-status', toggleStudentStatus);

/**
 * @route   POST /api/admin/students/import
 * @desc    Bulk import students from CSV/Excel
 * @access  Private/Admin
 */
router.post('/students/import', importStudents);

/**
 * @route   GET /api/admin/students/export
 * @desc    Export students list to CSV/Excel
 * @access  Private/Admin
 */
router.get('/students/export', exportStudents);

// ============================================================================
// FACULTY MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/faculty
 * @desc    Get all faculty members with optional filters
 * @access  Private/Admin
 * @query   {string} search - Search by name, email, or employee ID
 * @query   {string} department - Filter by department
 * @query   {string} status - Filter by status (active/inactive/all)
 * @query   {number} page - Page number for pagination
 * @query   {number} limit - Items per page
 */
router.get('/faculty', getFaculty);

/**
 * @route   GET /api/admin/faculty/:id
 * @desc    Get faculty details by ID
 * @access  Private/Admin
 */
router.get('/faculty/:id', getFacultyById);

/**
 * @route   POST /api/admin/faculty
 * @desc    Create a new faculty member
 * @access  Private/Admin
 */
router.post('/faculty', createFaculty);

/**
 * @route   PUT /api/admin/faculty/:id
 * @desc    Update faculty information
 * @access  Private/Admin
 */
router.put('/faculty/:id', updateFaculty);

/**
 * @route   DELETE /api/admin/faculty/:id
 * @desc    Delete a faculty member (permanent)
 * @access  Private/Admin
 */
router.delete('/faculty/:id', deleteFaculty);

/**
 * @route   PATCH /api/admin/faculty/:id/toggle-status
 * @desc    Activate or suspend a faculty account
 * @access  Private/Admin
 */
router.patch('/faculty/:id/toggle-status', toggleFacultyStatus);

// ============================================================================
// COURSE MANAGEMENT ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/courses
 * @desc    Get all courses with optional filters
 * @access  Private/Admin
 * @query   {string} search - Search by course code or name
 * @query   {string} department - Filter by department
 * @query   {string} status - Filter by status (active/inactive/all)
 * @query   {number} page - Page number for pagination
 * @query   {number} limit - Items per page
 */
router.get('/courses', getCourses);

/**
 * @route   GET /api/admin/courses/:id
 * @desc    Get course details by ID
 * @access  Private/Admin
 */
router.get('/courses/:id', getCourseById);

/**
 * @route   POST /api/admin/courses
 * @desc    Create a new course
 * @access  Private/Admin
 */
router.post('/courses', createCourse);

/**
 * @route   PUT /api/admin/courses/:id
 * @desc    Update course information
 * @access  Private/Admin
 */
router.put('/courses/:id', updateCourse);

/**
 * @route   DELETE /api/admin/courses/:id
 * @desc    Delete a course (permanent)
 * @access  Private/Admin
 */
router.delete('/courses/:id', deleteCourse);

// ============================================================================
// AI MONITORING ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/ai-monitoring
 * @desc    Get AI usage monitoring data
 * @access  Private/Admin
 */
router.get('/ai-monitoring', getAIMonitoring);

/**
 * @route   GET /api/admin/ai-monitoring/analytics
 * @desc    Get AI analytics and insights
 * @access  Private/Admin
 */
router.get('/ai-monitoring/analytics', getAIAnalytics);

/**
 * @route   GET /api/admin/ai-monitoring/stats
 * @desc    Get AI usage statistics
 * @access  Private/Admin
 */
router.get('/ai-monitoring/stats', getAIStats);

// ============================================================================
// SYSTEM LOGS ROUTES
// ============================================================================

/**
 * @route   GET /api/admin/system-logs
 * @desc    Get system logs with optional filters
 * @access  Private/Admin
 * @query   {string} level - Filter by log level (error/warn/info/debug)
 * @query   {number} page - Page number for pagination
 * @query   {number} limit - Items per page
 */
router.get('/system-logs', getSystemLogs);

/**
 * @route   GET /api/admin/system-logs/:id
 * @desc    Get log details by ID
 * @access  Private/Admin
 */
router.get('/system-logs/:id', getLogById);

/**
 * @route   GET /api/admin/system-logs/export
 * @desc    Export system logs
 * @access  Private/Admin
 * @query   {string} level - Filter by log level
 * @query   {string} startDate - Start date for export
 * @query   {string} endDate - End date for export
 */
router.get('/system-logs/export', exportLogs);

// ============================================================================
// EXPORT ROUTER
// ============================================================================
export default router;