import express from 'express';
import {
    getStudents,
    createStudent,
    updateStudent,
    deleteStudent,
    markStudentAsPlaced,
    getPlacementStats
} from '../controllers/hrStudents.controller.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getStudents);
router.get('/placement-stats', getPlacementStats);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
router.post('/:id/mark-placed', markStudentAsPlaced);

export default router;