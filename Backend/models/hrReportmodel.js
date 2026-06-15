import mongoose from 'mongoose';

const hrReportSchema = new mongoose.Schema(
{
    // Employee Information (Auto-fill from selected employee)
    employeeId: {
        type: String,
        required: true
    },
    employeeName: {
        type: String,
        required: true
    },
    employeeEmail: {
        type: String,
        required: true
    },
    employeeRole: {
        type: String,
        required: true
    },
    employeeDepartment: {
        type: String,
        default: ''
    },

    // Report Information
    reportTitle: {
        type: String,
        required: true
    },
    reportContent: {
        type: String,
        required: true
    },
    reportDate: {
        type: Date,
        default: Date.now
    },

    // Tasks Completed
    tasksCompleted: [{
        taskName: String,
        taskStatus: {
            type: String,
            enum: ['Completed', 'In Progress', 'Pending'],
            default: 'Completed'
        },
        timeSpent: String
    }],

    // Performance Metrics
    hoursWorked: {
        type: Number,
        default: 0,
        min: 0,
        max: 24
    },

    productivityScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },

    // Additional Information
    challenges: {
        type: String,
        default: ''
    },
    tomorrowPlan: {
        type: String,
        default: ''
    },
    needSupport: {
        type: String,
        default: ''
    },

    // Status Tracking
    status: {
        type: String,
        enum: ['Draft', 'Submitted', 'Sent To Manager', 'Viewed by Manager', 'Archived'],
        default: 'Submitted'
    },

    // Manager Review
    viewed: {
        type: Boolean,
        default: false
    },
    viewedAt: {
        type: Date,
        default: null
    },
    managerComments: {
        type: String,
        default: ''
    },

    // HR Comments
    hrComments: {
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
    isDeleted: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

// Indexes for better search performance
hrReportSchema.index({ employeeName: 'text', reportTitle: 'text' });
hrReportSchema.index({ employeeId: 1, reportDate: -1 });
hrReportSchema.index({ status: 1, createdAt: -1 });

const HRDailyReport = mongoose.model('HRDailyReport', hrReportSchema);

export default HRDailyReport;