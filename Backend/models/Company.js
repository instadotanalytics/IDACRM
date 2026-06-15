import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
    companyName: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true,
        unique: true
    },
    industry: {
        type: String,
        required: [true, 'Industry is required'],
        enum: ['IT Services', 'Banking', 'Consulting', 'Manufacturing', 'Healthcare', 'E-commerce', 'Education', 'Other'],
        default: 'Other'
    },
    website: {
        type: String,
        trim: true,
        default: ''
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        default: ''
    },
    hrName: {
        type: String,
        required: [true, 'HR name is required'],
        default: ''
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        default: ''
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true
    },
    openRoles: {
        type: Number,
        default: 0,
        min: 0
    },
    eligibility: {
        type: String,
        default: ''
    },
    salaryPackage: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'Hiring', 'Closed'],
        default: 'Active'
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    // HR Tracking Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdByName: {
        type: String,
        required: true
    },
    createdByEmail: {
        type: String,
        required: true
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedByName: {
        type: String
    },
    updatedByEmail: {
        type: String
    },
    deletedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deletedByName: {
        type: String
    },
    deletedAt: {
        type: Date
    }
}, { timestamps: true });

// Create indexes for search
companySchema.index({ companyName: 'text', hrName: 'text', email: 'text', location: 'text' });

const Company = mongoose.model('Company', companySchema);
export default Company;