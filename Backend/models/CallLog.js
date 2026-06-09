import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
    leadName: {
        type: String,
        required: [true, 'Lead name is required'],
        trim: true
    },
    leadPhone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    leadEmail: {
        type: String,
        lowercase: true,
        trim: true,
        default: ''
    },
    courseInterest: {
        type: String,
        default: ''
    },
    callType: {
        type: String,
        enum: ['Outgoing', 'Incoming'],
        default: 'Outgoing'
    },
    callStatus: {
        type: String,
        enum: ['Connected', 'Not Answered', 'Busy', 'Wrong Number'],
        default: 'Connected'
    },
    duration: {
        type: Number,
        default: 0,
        min: 0
    },
    callTime: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    },
    followUpRequired: {
        type: Boolean,
        default: false
    },
    followUpDate: {
        type: Date,
        default: null
    },
    
    // ✅ TRACKING FIELDS
    counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    counselorName: {
        type: String,
        default: ''
    },
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, { timestamps: true });

// Indexes for faster queries
callLogSchema.index({ counselorId: 1, callTime: -1 });
callLogSchema.index({ callTime: 1 });
callLogSchema.index({ leadName: 'text', leadPhone: 'text' });

const CallLog = mongoose.model('CallLog', callLogSchema);
export default CallLog;