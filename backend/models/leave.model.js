const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        index: true
    },
    leaveType: {
        type: String,
        enum: ['annual', 'sick', 'casual', 'maternity', 'paternity', 'unpaid', 'other'],
        default: 'annual',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    totalDays: {
        type: Number,
        default: 1
    },
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'cancelled'],
        default: 'pending',
        index: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
