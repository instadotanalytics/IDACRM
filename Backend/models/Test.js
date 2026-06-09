import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Test title is required'],
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
    duration: {
        type: Number,
        required: [true, 'Duration is required']
    },
    totalMarks: {
        type: Number,
        default: 0
    },
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        marks: Number
    }],
    pdfUrl: {
        type: String,
        default: ''
    },
    pdfPublicId: {
        type: String,
        default: ''
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
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
    
    status: {
        type: String,
        enum: ['upcoming', 'active', 'completed', 'expired'],
        default: 'upcoming'
    },
    
    // ✅ RESULTS TRACKING
    results: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admission'
        },
        studentName: {
            type: String,
            default: ''
        },
        startedAt: Date,
        submittedAt: Date,
        answers: [{
            questionId: Number,
            selectedOption: Number,
            isCorrect: Boolean,
            marksObtained: Number
        }],
        totalScore: Number,
        percentage: Number,
        status: {
            type: String,
            enum: ['started', 'submitted'],
            default: 'started'
        }
    }]
}, { timestamps: true });

const Test = mongoose.model('Test', testSchema);
export default Test;