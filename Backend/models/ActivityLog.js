import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT'],
        required: true
    },
    entityType: {
        type: String,
        enum: ['COMPANY', 'USER', 'PLACEMENT_DRIVE'],
        default: 'COMPANY'
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    entityName: {
        type: String
    },
    changes: {
        type: Object,
        default: {}
    },
    performedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        userName: {
            type: String,
            required: true
        },
        userEmail: {
            type: String,
            required: true
        },
        userRole: {
            type: String
        }
    },
    ipAddress: {
        type: String
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for faster queries
activityLogSchema.index({ entityId: 1, timestamp: -1 });
activityLogSchema.index({ performedBy: 1, timestamp: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);
export default ActivityLog;