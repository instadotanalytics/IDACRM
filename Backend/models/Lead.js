import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    leadId: {
        type: String,
        unique: true
    },
    source: {
        type: String,
        enum: ['Just Dial', 'Google', 'Facebook', 'Instagram', 'LinkedIn', 'Reference', 'Walk-in', 'Other'],
        default: 'Just Dial'
    },
    courseInterest: {
        type: String,
        required: true
    },
    enquiryDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['New', 'Contacted', 'Interested', 'Follow-up', 'Demo Scheduled', 'Converted', 'Lost', 'Not Interested'],
        default: 'New'
    },
    followUpDate: {
        type: Date,
        default: null
    },
    followUpTime: {
        type: String,
        default: ''
    },
    followUpNotes: {
        type: String,
        default: ''
    },
    counsellorNotes: {
        type: String,
        default: ''
    },
    preferredBatch: {
        type: String,
        default: ''
    },
    budget: {
        type: String,
        default: ''
    },
    calls: [{
        date: Date,
        duration: String,
        notes: String,
        callType: {
            type: String,
            enum: ['Incoming', 'Outgoing'],
            default: 'Outgoing'
        }
    }],
    convertedToStudent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admission'
    },
    conversionDate: Date,
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isConverted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

leadSchema.pre('save', async function() {
    if (!this.leadId) {
        const Lead = mongoose.model('Lead');
        const count = await Lead.countDocuments();
        this.leadId = `LEAD${String(count + 1).padStart(5, '0')}`;
    }
});

const Lead = mongoose.model('Lead', leadSchema);
export default Lead;