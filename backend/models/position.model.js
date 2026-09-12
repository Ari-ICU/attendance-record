const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Position title is required'],
        trim: true
    },
    department: {
        type: String,
        required: [true, 'Department is required'],
        trim: true
    },
    employeeCount: {
        type: Number,
        default: 0
    },
    description: {
        type: String,
        trim: true
    },
    level: {
        type: String,
        enum: ['Entry-Level', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'],
        default: 'Mid-Level'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Position', positionSchema);
