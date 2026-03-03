import express from 'express';
import { 
  getDeadlines, 
  createDeadline, 
  updateDeadline, 
  deleteDeadline 
} from '../controllers/deadline.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getDeadlines);
router.post('/', createDeadline);
router.put('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

export default router;