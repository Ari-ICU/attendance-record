const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, maxlength: 50 },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    phone: { type: String, required: true, trim: true, match: [/^\+?[0-9\s\-()]{7,20}$/, 'Invalid phone'] },
    position: { type: String, required: true, trim: true },
    department: { type: String, trim: true },
    type: { type: String, enum: ['employee', 'student'], default: 'employee' },
    dateOfJoining: { type: Date, required: true },

    // New photo field
    photoUrl: {
        type: String,
        default: null, // Can be null if no photo uploaded
        trim: true
    },

    faceDescriptor: {
        type: [Number], // 128-d descriptor as array
        default: null
    },
    faceVerifiedAt: {
        type: Date
    },
    faceVerificationEnabled: {
        type: Boolean,
        default: false
    },
    baseSalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    isActive: { type: Boolean, default: true }

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

employeeSchema.index({ email: 1 });

module.exports = mongoose.model('Employee', employeeSchema);
