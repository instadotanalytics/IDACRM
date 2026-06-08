import mongoose from 'mongoose';

const studentPerformanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },
    // Overall Stats
    overallAttendance: {
        type: Number,
        default: 0
    },
    totalPresent: {
        type: Number,
        default: 0
    },
    totalAbsent: {
        type: Number,
        default: 0
    },
    totalLeave: {
        type: Number,
        default: 0
    },
    totalLate: {
        type: Number,
        default: 0
    },
    // Assignment Stats
    totalAssignments: {
        type: Number,
        default: 0
    },
    submittedAssignments: {
        type: Number,
        default: 0
    },
    averageAssignmentScore: {
        type: Number,
        default: 0
    },
    // Test Stats
    totalTests: {
        type: Number,
        default: 0
    },
    averageTestScore: {
        type: Number,
        default: 0
    },
    highestTestScore: {
        type: Number,
        default: 0
    },
    lowestTestScore: {
        type: Number,
        default: 0
    },
    // Overall Grade
    overallGrade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        default: 'F'
    },
    overallPercentage: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        default: ''
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Compound index for unique student-batch combination
studentPerformanceSchema.index({ studentId: 1, batchId: 1 }, { unique: true });

const StudentPerformance = mongoose.model('StudentPerformance', studentPerformanceSchema);
export default StudentPerformance;