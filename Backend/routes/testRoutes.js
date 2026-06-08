import express from 'express';
import {
    createTest,
    getTests,
    getTestById,
    updateTest,
    deleteTest,
    submitTest,
    getTestResults
} from '../controllers/testController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadTestPDF } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Test routes
router.post('/', uploadTestPDF.single('pdfFile'), createTest);
router.get('/', getTests);
router.get('/:id', getTestById);
router.put('/:id', uploadTestPDF.single('pdfFile'), updateTest);
router.delete('/:id', deleteTest);
router.post('/:id/submit', submitTest);
router.get('/:id/results', getTestResults);

export default router;