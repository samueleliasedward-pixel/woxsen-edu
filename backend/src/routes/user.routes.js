import express from 'express';
import {
  getFacultyUsers,
  getFacultyById
} from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);

router.get('/faculty', getFacultyUsers);
router.get('/faculty/:id', getFacultyById);

export default router;