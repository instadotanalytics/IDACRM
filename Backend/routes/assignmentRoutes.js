import express from 'express';
import {
    createAssignment,
    getAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    submitAssignment,
    gradeAssignment,
    getStudentAssignments
} from '../controllers/assignmentController.js';
import { protect, trainerOnly } from '../middleware/authMiddleware.js';
import { uploadAssignment } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Trainer only routes
router.post('/', trainerOnly, uploadAssignment.single('attachment'), createAssignment);
router.put('/:id', trainerOnly, uploadAssignment.single('attachment'), updateAssignment);
router.delete('/:id', trainerOnly, deleteAssignment);
router.post('/:id/grade', trainerOnly, gradeAssignment);

// Student submission route
router.post('/submit', uploadAssignment.single('submission'), submitAssignment);

// Get routes
router.get('/', getAssignments);
router.get('/student', getStudentAssignments);
router.get('/:id', getAssignmentById);

export default router;