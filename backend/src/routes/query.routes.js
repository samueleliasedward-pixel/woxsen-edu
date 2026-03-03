import express from 'express';
import {
  getMyQueries,
  getQueryById,
  createQuery,
  respondToQuery,
  getQueryStats,
  getAssignedQueries
} from '../controllers/query.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/my', getMyQueries);
router.get('/assigned', getAssignedQueries);
router.get('/stats', getQueryStats);
router.get('/:id', getQueryById);
router.post('/', createQuery);
router.post('/:id/respond', respondToQuery);

export default router;