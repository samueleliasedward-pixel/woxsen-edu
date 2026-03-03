import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  getFiles,
  uploadFile,
  downloadFile,
  deleteFile,
  createFolder
} from '../controllers/file.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

const router = express.Router();

router.use(protect);

// Admin routes
router.get('/', authorize('ADMIN'), getFiles);
router.post('/upload', authorize('ADMIN'), upload.single('file'), uploadFile);
router.post('/folder', authorize('ADMIN'), createFolder);
router.get('/download/:id', authorize('ADMIN'), downloadFile);
router.delete('/:id', authorize('ADMIN'), deleteFile);

export default router;