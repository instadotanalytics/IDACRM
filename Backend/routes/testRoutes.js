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
import { protect, trainerOnly } from '../middleware/authMiddleware.js';
import { uploadTestPDF } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);

// Trainer only routes
router.post('/', trainerOnly, uploadTestPDF.single('pdfFile'), createTest);
router.put('/:id', trainerOnly, uploadTestPDF.single('pdfFile'), updateTest);
router.delete('/:id', trainerOnly, deleteTest);

// Student submission
router.post('/:id/submit', submitTest);

// Get routes
router.get('/', getTests);
router.get('/:id', getTestById);
router.get('/:id/results', getTestResults);

export default router;