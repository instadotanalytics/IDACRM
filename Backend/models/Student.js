import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    phone: {
        type: String,
        default: ''
    },
    enrollmentId: {
        type: String,
        unique: true,
        sparse: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch'
    },
    course: {
        type: String,
        default: ''
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'completed'],
        default: 'active'
    },
    photo: {
        type: String,
        default: ''
    },
    address: {
        type: String,
        default: ''
    },
    parentName: {
        type: String,
        default: ''
    },
    parentPhone: {
        type: String,
        default: ''
    },
    qualifications: {
        type: String,
        default: ''
    }
}, { timestamps: true });

const Student = mongoose.model('Student', studentSchema);
export default Student;