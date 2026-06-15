import mongoose from 'mongoose';

const hrStudentSchema = new mongoose.Schema({
    // Personal Information
    studentName: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    studentEmail: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        unique: true
    },
    studentPhone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    studentRollNo: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true
    },
    studentImage: {
        type: String,
        default: ''
    },
    
    // Academic Information
    course: {
        type: String,
        required: true,
        enum: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'BBA', 'Other']
    },
    branch: {
        type: String,
        required: true,
        enum: ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'Chemical', 'Other']
    },
    semester: {
        type: Number,
        required: true,
        min: 1,
        max: 8
    },
    percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    passingYear: {
        type: Number,
        required: true
    },
    backlog: {
        type: Boolean,
        default: false
    },
    backlogCount: {
        type: Number,
        default: 0
    },
    
    // Placement Information (EK BAAR LIKHEIN, DO BAAR NAHI)
    placementStatus: {
        type: String,
        enum: ['Not Placed', 'In Process', 'Placed'],
        default: 'Not Placed'
    },
    placedCompany: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    placedCompanyName: {
        type: String,
        default: ''
    },
    placedPackage: {
        type: Number,
        default: 0
    },
    placedDate: {
        type: Date,
        default: null
    },
    offerLetterUrl: {
        type: String,
        default: ''
    },
    
    // Skills
    technicalSkills: [{
        type: String
    }],
    softSkills: [{
        type: String
    }],
    certifications: [{
        name: String,
        issuer: String,
        date: Date
    }],
    
    // Documents
    resumeUrl: {
        type: String,
        default: ''
    },
    
    // Contact Information
    address: {
        type: String,
        default: ''
    },
    city: {
        type: String,
        default: ''
    },
    state: {
        type: String,
        default: ''
    },
    pincode: {
        type: String,
        default: ''
    },
    
    // Parent/Guardian
    parentName: {
        type: String,
        default: ''
    },
    parentPhone: {
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
    createdByEmail: {
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

// Indexes for search
hrStudentSchema.index({ studentName: 'text', studentEmail: 'text', studentRollNo: 'text' });
hrStudentSchema.index({ placementStatus: 1 });
hrStudentSchema.index({ branch: 1, course: 1 });

const HRStudent = mongoose.model('HRStudent', hrStudentSchema);
export default HRStudent;