import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: Date,
    endDate: Date,
    timings: String,
    days: [String],
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed'],
        default: 'upcoming'
    },
    capacity: {
        type: Number,
        default: 30
    }
}, { timestamps: true });

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;