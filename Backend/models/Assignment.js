import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Assignment title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
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
    dueDate: {
        type: Date,
        required: [true, 'Due date is required']
    },
    totalMarks: {
        type: Number,
        default: 100,
        min: 0
    },
    attachments: [{
        name: String,
        url: String,
        publicId: String
    }],
    
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
    
    status: {
        type: String,
        enum: ['active', 'expired', 'draft'],
        default: 'active'
    },
    
    // ✅ SUBMISSION TRACKING
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admission'
        },
        studentName: {
            type: String,
            default: ''
        },
        submittedAt: {
            type: Date,
            default: Date.now
        },
        fileUrl: String,
        filePublicId: String,
        fileName: String,
        marks: {
            type: Number,
            default: null
        },
        feedback: {
            type: String,
            default: ''
        },
        graded: {
            type: Boolean,
            default: false
        },
        gradedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        gradedByName: {
            type: String,
            default: ''
        },
        gradedAt: {
            type: Date,
            default: null
        }
    }]
}, { timestamps: true });

// Auto-update status
assignmentSchema.pre('save', async function() {
    if (this.dueDate && this.dueDate < new Date()) {
        this.status = 'expired';
    }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;