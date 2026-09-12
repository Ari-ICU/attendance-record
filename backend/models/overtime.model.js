const mongoose = require('mongoose');

const overtimeSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true,
        index: true
    },
    date: {
        type: Date,
        required: true,
        index: true
    },
    hours: {
        type: Number,
        required: true,
        min: 0.5,
        max: 24
    },
    reason: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
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
    hourlyRate: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Overtime', overtimeSchema);
