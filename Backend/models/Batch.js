import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Batch name is required'],
        trim: true
    },
    code: {
        type: String,
        unique: true,
        sparse: true,
        uppercase: true,
        trim: true
    },
    course: {
        type: String,
        required: [true, 'Course name is required']
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    startDate: {
        type: Date,
        required: [true, 'Start date is required']
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required']
    },
    timings: {
        type: String,
        required: [true, 'Timings are required']
    },
    days: [{
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    capacity: {
        type: Number,
        default: 30,
        min: 1,
        max: 100
    },
    currentStudents: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    description: {
        type: String,
        default: ''
    },
    room: {
        type: String,
        default: ''
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Auto-generate batch code if not provided (remove pre-save to avoid issues)
// batchSchema.pre('save', async function(next) {
//     if (!this.code) {
//         const year = new Date().getFullYear();
//         const Batch = mongoose.model('Batch');
//         const count = await Batch.countDocuments();
//         this.code = `BATCH${year}${String(count + 1).padStart(3, '0')}`;
//     }
//     next();
// });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;