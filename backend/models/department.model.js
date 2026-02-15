const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Department name is required'],
        unique: true,
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    head: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
    },
    isActive: {
        type: Boolean,
        default: true,
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for member count (will be populated in controller)
departmentSchema.virtual('memberCount', {
    ref: 'Employee',
    localField: 'name',
    foreignField: 'department',
    count: true
});

module.exports = mongoose.model('Department', departmentSchema);
