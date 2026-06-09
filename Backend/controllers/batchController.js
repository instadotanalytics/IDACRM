import Batch from '../models/Batch.js';
import User from '../models/User.js';

// @desc    Create new batch (with trainer tracking)
// @route   POST /api/batches
export const createBatch = async (req, res) => {
    try {
        const {
            name, code, course, trainerId, startDate, endDate,
            timings, days, capacity, description, room
        } = req.body;

        console.log('=========================================');
        console.log('📦 Creating batch by:', req.user.name);
        console.log('🆔 Trainer ID:', req.user._id);
        console.log('📋 Batch name:', name);
        console.log('=========================================');

        // Validation
        if (!name || !course || !startDate || !endDate || !timings) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields: name, course, startDate, endDate, timings are required'
            });
        }

        // Check if batch code already exists
        if (code) {
            const existingBatch = await Batch.findOne({ code });
            if (existingBatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Batch code already exists'
                });
            }
        }

        // Generate batch code if not provided
        let finalCode = code;
        if (!finalCode) {
            const year = new Date().getFullYear();
            const count = await Batch.countDocuments();
            finalCode = `BATCH${year}${String(count + 1).padStart(3, '0')}`;
        }

        // Determine assigned trainer (use provided or current user)
        const assignedTrainerId = trainerId || req.user._id;

        // ✅ Create batch with tracking fields
        const batch = await Batch.create({
            name,
            code: finalCode,
            course,
            trainerId: assignedTrainerId,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            timings,
            days: days || [],
            capacity: capacity || 30,
            description: description || '',
            room: room || '',
            status: new Date(startDate) > new Date() ? 'upcoming' : 'active',
            createdBy: req.user._id,        // ✅ Who created this batch
            createdByName: req.user.name     // ✅ Creator's name for quick display
        });

        // ✅ Add batch to trainer's assignedBatches array
        await User.findByIdAndUpdate(
            assignedTrainerId,
            { $addToSet: { assignedBatches: batch._id } }
        );

        console.log('✅ Batch created successfully!');
        console.log('📌 Batch ID:', batch._id);
        console.log('👨‍🏫 Created by:', req.user.name);
        console.log('👨‍🏫 Assigned to:', assignedTrainerId);
        console.log('=========================================');

        res.status(201).json({
            success: true,
            message: 'Batch created successfully',
            data: batch
        });
        
    } catch (error) {
        console.error('❌ Create batch error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// @desc    Get batches created by logged-in user (trainer/admin)
// @route   GET /api/batches/my-created
export const getMyCreatedBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ 
            createdBy: req.user._id
        }).populate('trainerId', 'name email')
          .populate('createdBy', 'name email')
          .sort('-createdAt');

        console.log(`📊 Found ${batches.length} batches created by:`, req.user.name);

        res.json({
            success: true,
            data: batches,
            message: `Batches created by ${req.user.name}`
        });
        
    } catch (error) {
        console.error('Error getting my created batches:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Get trainer's assigned batches
// @route   GET /api/batches/trainer/assigned
export const getTrainerAssignedBatches = async (req, res) => {
    try {
        const batches = await Batch.find({ 
            trainerId: req.user._id 
        }).populate('trainerId', 'name email')
          .populate('createdBy', 'name email')
          .sort('startDate');
        
        console.log(`📊 Found ${batches.length} batches assigned to trainer:`, req.user.name);

        res.json({ 
            success: true, 
            data: batches 
        });
    } catch (error) {
        console.error('Error getting trainer batches:', error);
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
};

// @desc    Get all batches (admin only)
// @route   GET /api/batches
export const getAllBatches = async (req, res) => {
    try {
        const batches = await Batch.find()
            .populate('trainerId', 'name email')
            .populate('createdBy', 'name email')
            .sort('-createdAt');
        
        res.json({ success: true, data: batches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single batch
// @route   GET /api/batches/:id
export const getBatchById = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id)
            .populate('trainerId', 'name email phone')
            .populate('createdBy', 'name email');
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        res.json({ success: true, data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update batch
// @route   PUT /api/batches/:id
export const updateBatch = async (req, res) => {
    try {
        const batch = await Batch.findById(req.params.id);
        
        if (!batch) {
            return res.status(404).json({ success: false, message: 'Batch not found' });
        }
        
        const updatedBatch = await Batch.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        res.json({ success: true, message: 'Batch updated', data: updatedBatch });
    } catch (error) {
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
        
        // Remove batch from trainer's assigned list
        if (batch.trainerId) {
            await User.findByIdAndUpdate(batch.trainerId, {
                $pull: { assignedBatches: batch._id }
            });
        }
        
        await batch.deleteOne();
        
        res.json({ success: true, message: 'Batch deleted successfully' });
    } catch (error) {
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
        
        // Remove old trainer reference
        if (batch.trainerId) {
            await User.findByIdAndUpdate(batch.trainerId, {
                $pull: { assignedBatches: batch._id }
            });
        }
        
        // Update batch with new trainer
        batch.trainerId = trainerId;
        await batch.save();
        
        // Add batch to new trainer's assigned list
        if (trainerId) {
            await User.findByIdAndUpdate(trainerId, {
                $addToSet: { assignedBatches: batch._id }
            });
        }
        
        res.json({ success: true, message: 'Trainer assigned successfully', data: batch });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};