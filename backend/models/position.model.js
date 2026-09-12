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
    responsibilities: {
        type: [String],
        default: []
    },
    skills: {
        type: [String],
        default: []
    },
    salaryRange: {
        type: String,
        trim: true,
        default: '$1,200 – $2,800 / mo'
    },
    employmentType: {
        type: String,
        trim: true,
        default: 'Full-time / Permanent'
    },
    experienceReq: {
        type: String,
        trim: true,
        default: '2 – 5 Years'
    },
    workPolicy: {
        type: String,
        trim: true,
        default: 'Hybrid (3 days on-site)'
    },
    workingHours: {
        type: String,
        trim: true,
        default: '08:00 – 17:00 (Mon–Fri)'
    },
    level: {
        type: String,
        enum: ['Entry-Level', 'Associate', 'Junior', 'Mid-Level', 'Senior', 'Lead', 'Executive'],
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
