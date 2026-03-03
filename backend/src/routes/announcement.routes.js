import express from 'express';
import {
  getAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcement.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

// Admin routes
router.get('/', authorize('ADMIN'), getAnnouncements);
router.post('/', authorize('ADMIN'), createAnnouncement);
router.put('/:id', authorize('ADMIN'), updateAnnouncement);
router.delete('/:id', authorize('ADMIN'), deleteAnnouncement);

// Student/Faculty routes (read-only)
router.get('/public', getAnnouncements);

export default router;