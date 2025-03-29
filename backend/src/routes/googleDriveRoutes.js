import express from 'express';
import multer from 'multer';
import { uploadFile, getFile, deleteFile, listFiles } from '../controllers/googleDriveController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Upload a file to Google Drive
router.post('/upload', upload.single('file'), uploadFile);

// Get a file from Google Drive
router.get('/files/:fileId', getFile);

// Delete a file from Google Drive
router.delete('/files/:fileId', deleteFile);

// List files in Google Drive
router.get('/files', listFiles);

export default router; 