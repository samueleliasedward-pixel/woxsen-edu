// backend/src/routes/auth.routes.js
import express from 'express';
import { 
  register, 
  login, 
  getMe, 
  logout,
  checkEmail,
  checkStudentId,
  checkEmployeeId 
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
// These don't require authentication
router.post('/register', register);        // POST /api/auth/register
router.post('/login', login);               // POST /api/auth/login
router.post('/check-email', checkEmail);    // POST /api/auth/check-email
router.post('/check-student-id', checkStudentId);
router.post('/check-employee-id', checkEmployeeId);

// ===== PROTECTED ROUTES =====
// These require a valid JWT token
router.get('/me', protect, getMe);          // GET /api/auth/me
router.post('/logout', protect, logout);    // POST /api/auth/logout

export default router;