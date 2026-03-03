import express from 'express';
import {
  getSystemLogs,
  getLogById,
  createSystemLog,
  cleanupOldLogs,
  exportLogs,
  clearAllLogs,
  getLogDetails
} from '../controllers/systemLog.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getSystemLogs);
router.get('/export', exportLogs);
router.post('/', createSystemLog);
router.delete('/cleanup', cleanupOldLogs);
router.delete('/', clearAllLogs);
router.get('/:id', getLogById);
router.get('/:id/details', getLogDetails);

export default router;