import mongoose from 'mongoose';

const courseMaterialSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['video', 'pdf', 'document', 'presentation', 'link', 'assignment'],
        required: true
    },
    course: {
        type: String,
        required: [true, 'Course name is required']
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    topic: {
        type: String,
        default: ''
    },
    fileUrl: {
        type: String,
        default: ''
    },
    filePublicId: {
        type: String,
        default: ''
    },
    fileName: {
        type: String,
        default: ''
    },
    externalLink: {
        type: String,
        default: ''
    },
    duration: {
        type: String,
        default: ''
    },
    size: {
        type: String,
        default: ''
    },
    
    // ✅ TRACKING FIELDS
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByName: {
        type: String,
        default: ''
    },
    trainerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    trainerName: {
        type: String,
        default: ''
    },
    
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);
export default CourseMaterial;