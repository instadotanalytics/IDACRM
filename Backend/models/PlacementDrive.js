import mongoose from 'mongoose';

const placementDriveSchema = new mongoose.Schema({
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    driveTitle: {
        type: String,
        required: true
    },
    driveDate: {
        type: Date,
        required: true
    },
    driveTime: {
        type: String,
        default: '10:00 AM'
    },
    location: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid'],
        default: 'Online'
    },
    meetingLink: {
        type: String,
        default: ''
    },
    ctc: {
        type: Number,
        required: true,
        min: 0
    },
    requiredSkills: [{
        type: String
    }],
    openPositions: {
        type: Number,
        required: true,
        min: 1
    },
    eligibility: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Upcoming'
    },
    studentsApplied: {
        type: Number,
        default: 0
    },
    studentsSelected: {
        type: Number,
        default: 0
    },
    studentsAttended: {
        type: Number,
        default: 0
    },
    registeredStudents: [{
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student'
        },
        studentName: String,
        studentEmail: String,
        status: {
            type: String,
            enum: ['Registered', 'Attended', 'Selected', 'Rejected'],
            default: 'Registered'
        },
        registeredAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByName: {
        type: String,
        required: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for better performance
placementDriveSchema.index({ company: 1, driveDate: -1 });
placementDriveSchema.index({ status: 1, driveDate: 1 });
placementDriveSchema.index({ companyName: 'text', driveTitle: 'text' });

const PlacementDrive = mongoose.model('PlacementDrive', placementDriveSchema);
export default PlacementDrive;