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

router.use(protect);

// ✅ Trainer only routes (Create, Update, Delete, Grade)
router.post('/', trainerOnly, uploadAssignment.single('attachment'), createAssignment);
router.put('/:id', trainerOnly, uploadAssignment.single('attachment'), updateAssignment);
router.delete('/:id', trainerOnly, deleteAssignment);
router.post('/:id/grade', trainerOnly, gradeAssignment);

// ✅ Student submission (anyone can submit)
router.post('/submit', uploadAssignment.single('submission'), submitAssignment);

// ✅ Get routes - Everyone can view (including counselors)
router.get('/', getAssignments);
router.get('/student', getStudentAssignments);
router.get('/:id', getAssignmentById);

export default router;