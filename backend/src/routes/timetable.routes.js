import express from 'express';
import { 
  getTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  generateTimetable
} from '../controllers/timetable.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/', getTimetable);
router.post('/', createTimetableEntry);
router.post('/generate', generateTimetable);
router.put('/:id', updateTimetableEntry);
router.delete('/:id', deleteTimetableEntry);

export default router;