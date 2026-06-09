import express from 'express';
import {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    assignTrainer,
    getMyCreatedBatches,
    getTrainerAssignedBatches
} from '../controllers/batchController.js';
import { protect, adminManagerOnly, trainerOnly } from '../middleware/authMiddleware.js';
import Admission from '../models/Admission.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

const router = express.Router();

// ✅ All routes require authentication
router.use(protect);

// ✅ TRAINER ROUTES (with tracking)
router.get('/trainer/my-batches', trainerOnly, getMyCreatedBatches);
router.get('/trainer/assigned', trainerOnly, getTrainerAssignedBatches);

// ✅ GET /api/batches/trainer/assigned-with-count - Trainer ke batches with student count
router.get('/trainer/assigned-with-count', trainerOnly, async (req, res) => {
    try {
        console.log('Fetching batches for trainer:', req.user.name);
        
        let batches = await Batch.find({ 
            trainerId: req.user._id 
        }).populate('trainerId', 'name email')
          .populate('createdBy', 'name email');
        
        // Get all students for count
        const students = await Student.find();
        
        const batchesWithCount = batches.map(batch => {
            const studentCount = students.filter(s => {
                const batchIdFromStudent = s.batchId?.toString();
                return batchIdFromStudent === batch._id.toString();
            }).length;
            
            return {
                ...batch.toObject(),
                studentsCount: studentCount,
                currentStudents: studentCount
            };
        });
        
        res.json({ success: true, data: batchesWithCount });
        
    } catch (error) {
        console.error('Error fetching trainer batches:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// ✅ ADMIN ROUTES
router.post('/', adminManagerOnly, createBatch);
router.get('/', adminManagerOnly, getAllBatches);
router.get('/:id', getBatchById);
router.put('/:id', adminManagerOnly, updateBatch);
router.delete('/:id', adminManagerOnly, deleteBatch);
router.put('/:id/assign-trainer', adminManagerOnly, assignTrainer);

export default router;