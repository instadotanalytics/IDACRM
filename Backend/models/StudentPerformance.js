import mongoose from 'mongoose';

const studentPerformanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    batchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Batch',
        required: true
    },

    // Attendance
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

    // Assignments
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

    // Tests
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

    // Overall Performance
    overallPercentage: {
        type: Number,
        default: 0
    },
    overallGrade: {
        type: String,
        enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'],
        default: 'F'
    },

    remarks: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

// Auto Calculate Performance Before Save
studentPerformanceSchema.pre('save', function () {

    this.overallPercentage =
        (this.overallAttendance * 0.2) +
        (this.averageAssignmentScore * 0.3) +
        (this.averageTestScore * 0.5);

    if (this.overallPercentage >= 90) {
        this.overallGrade = 'A+';
    } else if (this.overallPercentage >= 80) {
        this.overallGrade = 'A';
    } else if (this.overallPercentage >= 70) {
        this.overallGrade = 'B+';
    } else if (this.overallPercentage >= 60) {
        this.overallGrade = 'B';
    } else if (this.overallPercentage >= 50) {
        this.overallGrade = 'C+';
    } else if (this.overallPercentage >= 45) {
        this.overallGrade = 'C';
    } else if (this.overallPercentage >= 35) {
        this.overallGrade = 'D';
    } else {
        this.overallGrade = 'F';
    }
});

// One Performance Record Per Student Per Batch
studentPerformanceSchema.index(
    { studentId: 1, batchId: 1 },
    { unique: true }
);

const StudentPerformance = mongoose.model(
    'StudentPerformance',
    studentPerformanceSchema
);

export default StudentPerformance;