import express from 'express';
import { getPublicStats, getDetailedStats } from '../controllers/stats.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public route - no authentication needed
router.get('/public', getPublicStats);

// Protected route for admin
router.get('/detailed', protect, authorize('ADMIN'), getDetailedStats);

export default router;