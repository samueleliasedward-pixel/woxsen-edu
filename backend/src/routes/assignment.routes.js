import express from 'express'; 
import { 
  getAssignments, 
  getAssignmentById, 
  createAssignment, 
  updateAssignment, 
  deleteAssignment, 
  submitAssignment, 
  getSubmissions, 
  gradeSubmission 
} from '../controllers/assignment.controller.js'; 
import { protect, authorize } from '../middleware/auth.middleware.js'; 
import { uploadMultiple } from '../middleware/upload.middleware.js'; 
 
const router = express.Router(); 
 
router.use(protect); 
 
router.route('/') 
  .get(getAssignments) 
  .post(authorize('FACULTY', 'ADMIN'), uploadMultiple('attachments', 5), 
createAssignment); 
 
router.route('/:id') 
  .get(getAssignmentById) 
  .put(authorize('FACULTY', 'ADMIN'), updateAssignment) 
  .delete(authorize('FACULTY', 'ADMIN'), deleteAssignment); 
 
router.post('/:id/submit', authorize('STUDENT'), uploadMultiple('files', 3), 
submitAssignment); 
 
router.get('/:id/submissions', authorize('FACULTY'), getSubmissions); 
router.post('/submissions/:submissionId/grade', authorize('FACULTY'), 
gradeSubmission); 
 
export default router;