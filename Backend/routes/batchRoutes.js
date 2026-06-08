import express from 'express';
import {
    createBatch,
    getAllBatches,
    getBatchById,
    updateBatch,
    deleteBatch,
    assignTrainer
} from '../controllers/batchController.js';
import { protect } from '../middleware/authMiddleware.js';
import Admission from '../models/Admission.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

const router = express.Router();

// ✅ GET /api/batches/trainer/assigned - Trainer ke saare batches dikhao
router.get('/trainer/assigned', protect, async (req, res) => {
    try {
        console.log('Fetching batches for trainer:', req.user._id);
        console.log('Trainer role:', req.user.role);
        
        // Pehle trainer ko assign saare batches do
        let batches = await Batch.find({ 
            trainerId: req.user._id 
        }).populate('trainerId', 'name email');
        
        console.log('Batches found with trainerId:', batches.length);
        
        // Agar koi batch assign nahi hai, toh saare batches dikhao (temporary)
        if (batches.length === 0) {
            console.log('No batches assigned, fetching all batches...');
            batches = await Batch.find({}).populate('trainerId', 'name email');
            console.log('All batches found:', batches.length);
        }
        
        // Students count nikalne ke liye
        const students = await Student.find();
        
        const batchesWithCount = batches.map(batch => {
            // Students count in this batch
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

// ✅ GET /api/batches - Sabko dekhne ki permission
router.get('/', protect, async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('trainerId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ POST /api/batches - Create batch
router.post('/', protect, async (req, res) => {
    try {
        const batchData = {
            ...req.body,
            createdBy: req.user._id
        };
        
        // Auto-generate code if not provided
        if (!batchData.code) {
            const count = await Batch.countDocuments();
            const year = new Date().getFullYear();
            batchData.code = `BATCH${year}${String(count + 1).padStart(3, '0')}`;
        }
        
        const batch = await Batch.create(batchData);
        res.status(201).json({ success: true, data: batch });
        
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ GET /api/batches/:id
router.get('/:id', protect, async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('trainerId', 'name email');
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ PUT /api/batches/:id
router.put('/:id', protect, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ PUT /api/batches/:id/assign-trainer
router.put('/:id/assign-trainer', protect, async (req, res) => {
    try {
        const { trainerId } = req.body;
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            { trainerId: trainerId },
            { new: true }
        );
        
        res.json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ✅ DELETE /api/batches/:id
router.delete('/:id', protect, async (req, res) => {
    try {
        const batch = await Batch.findByIdAndDelete(req.params.id);
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;