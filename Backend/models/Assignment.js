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
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'expired', 'draft'],
        default: 'active'
    },
    submissions: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admission'
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
        }
    }]
}, { timestamps: true });

// ✅ FIXED: Remove 'next' parameter - use async function without next
assignmentSchema.pre('save', async function() {
    if (this.dueDate && this.dueDate < new Date()) {
        this.status = 'expired';
    }
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;