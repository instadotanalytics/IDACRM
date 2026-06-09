import Batch from '../models/Batch.js';
import User from '../models/User.js';
import Admission from '../models/Admission.js';

// @desc    Create new batch
// @route   POST /api/batches
export const createBatch = async (req, res) => {
    try {
        const {
            name, code, course, trainerId, startDate, endDate,
            timings, days, capacity, description, room
        } = req.body;

        console.log('Creating batch:', name);
        console.log('Created by:', req.user.name);

        if (!name || !course || !startDate || !endDate || !timings) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        let finalCode = code;
        if (!finalCode) {
            const year = new Date().getFullYear();
            const count = await Batch.countDocuments();
            finalCode = `BATCH${year}${String(count + 1).padStart(3, '0')}`;
        }

        const batch = await Batch.create({
            name,
            code: finalCode,
            course,
            trainerId: trainerId || null,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            timings,
            days: days || [],
            capacity: capacity || 30,
            description: description || '',
            room: room || '',
            status: new Date(startDate) > new Date() ? 'upcoming' : 'active',
            createdBy: req.user._id,
            createdByName: req.user.name
        });

        if (trainerId) {
            await User.findByIdAndUpdate(trainerId, {
                $addToSet: { assignedBatches: batch._id }
            });
        }

        console.log('Batch created successfully:', batch._id);

        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            data: batch
        });
    } catch (error) {
        console.error('Create batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all batches
// @route   GET /api/batches
export const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('trainerId', 'name email')
            .populate('createdBy', 'name email')
            .sort('-createdAt');
        
        const students = await Admission.find();
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
        console.error('Get batches error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get trainer's assigned batches
// @route   GET /api/batches/trainer/assigned
export const getTrainerAssignedBatches = async (req, res) => {
    try {
        console.log('Fetching batches for trainer:', req.user._id);
        console.log('Trainer name:', req.user.name);
        
        const batches = await Batch.find({ 
            trainerId: req.user._id 
        }).populate('trainerId', 'name email')
          .populate('createdBy', 'name email');
        
        const students = await Admission.find();
        
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
        console.error('Error getting trainer batches:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
export const getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('trainerId', 'name email')
            .populate('createdBy', 'name email');
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, data: batch });
    } catch (error) {
        console.error('Get batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
export const updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, message: 'Batch updated', data: batch });
    } catch (error) {
        console.error('Update batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete batch
// @route   DELETE /api/batches/:id
export const deleteBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        if (batch.trainerId) {
            await User.findByIdAndUpdate(batch.trainerId, {
                $pull: { assignedBatches: batch._id }
            });
        }
        
        await batch.deleteOne();
        
        res.json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
        console.error('Delete batch error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Assign trainer to batch
// @route   PUT /api/batches/:id/assign-trainer
export const assignTrainer = async (req, res) => {
    try {
        const { trainerId } = req.body;
        const batch = await Batch.findById(req.params.id);
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        if (batch.trainerId) {
            await User.findByIdAndUpdate(batch.trainerId, {
                $pull: { assignedBatches: batch._id }
            });
        }
        
        batch.trainerId = trainerId;
        await batch.save();
        
        if (trainerId) {
            await User.findByIdAndUpdate(trainerId, {
                $addToSet: { assignedBatches: batch._id }
            });
        }
        
        res.json({ success: true, message: 'Trainer assigned successfully', data: batch });
    } catch (error) {
        console.error('Assign trainer error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get batches created by logged-in user
// @route   GET /api/batches/my-created
export const getMyCreatedBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ 
            createdBy: req.user._id 
        }).populate('trainerId', 'name email')
          .populate('createdBy', 'name email')
          .sort('-createdAt');
        
        res.json({ success: true, data: batches });
    } catch (error) {
        console.error('Get my created batches error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ NO DUPLICATE EXPORTS - All functions are already exported with 'export const'
// The export block below is REMOVED to prevent duplicate export errors