import mongoose from 'mongoose';

const hrInterviewSchema = new mongoose.Schema({
    // Student Details
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HRStudent',
        required: true
    },
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HRStudent'
    },
    studentName: {
        type: String,
        required: true
    },
    studentEmail: {
        type: String,
        required: true
    },
    studentRollNo: {
        type: String,
        required: true
    },
    studentPhone: {
        type: String,
        default: ''
    },
    
    // Company Details
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    companyName: {
        type: String,
        required: true
    },
    companyContact: {
        type: String,
        default: ''
    },
    
    // Drive Details
    placementDrive: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PlacementDrive'
    },
    driveName: {
        type: String,
        default: ''
    },
    
    // Interview Schedule
    interviewDate: {
        type: Date,
        required: true
    },
    interviewTime: {
        type: String,
        required: true
    },
    interviewMode: {
        type: String,
        enum: ['Online', 'Offline', 'Hybrid'],
        default: 'Online'
    },
    interviewLink: {
        type: String,
        default: ''
    },
    venue: {
        type: String,
        default: ''
    },
    venueAddress: {
        type: String,
        default: ''
    },
    
    // Interviewer Details
    interviewerName: {
        type: String,
        default: ''
    },
    interviewerDesignation: {
        type: String,
        default: ''
    },
    interviewerEmail: {
        type: String,
        default: ''
    },
    interviewerPhone: {
        type: String,
        default: ''
    },
    
    // Interview Status & Result
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Selected', 'Rejected', 'Cancelled', 'Rescheduled'],
        default: 'Scheduled'
    },
    
    // Feedback & Scores
    feedback: {
        type: String,
        default: ''
    },
    rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
    },
    technicalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    communicationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null
    },
    
    // Result Details (NEW FIELDS)
    resultDate: {
        type: Date,
        default: null
    },
    offeredPackage: {
        type: Number,
        default: 0,
        min: 0
    },
    joiningDate: {
        type: Date,
        default: null
    },
    offerLetterSent: {
        type: Boolean,
        default: false
    },
    offerLetterDate: {
        type: Date,
        default: null
    },
    offerAccepted: {
        type: Boolean,
        default: false
    },
    
    // Remarks
    remarks: {
        type: String,
        default: ''
    },
    
    // Tracking
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdByName: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedByName: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Indexes for better performance
hrInterviewSchema.index({ student: 1, company: 1 });
hrInterviewSchema.index({ interviewDate: 1, status: 1 });
hrInterviewSchema.index({ studentName: 'text', companyName: 'text' });
hrInterviewSchema.index({ status: 1, resultDate: -1 });

// Virtual for selection rate
hrInterviewSchema.virtual('isPlaced').get(function() {
    return this.status === 'Selected';
});

const HRInterview = mongoose.model('HRInterview', hrInterviewSchema);
export default HRInterview;