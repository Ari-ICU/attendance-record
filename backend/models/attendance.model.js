const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    checkIn: {
        time: { type: Date, default: null },
        location: {
            latitude: Number,
            longitude: Number,
            address: { type: String, trim: true }
        },
        method: { type: String, enum: ['manual', 'qr_code', 'gps', 'biometric', 'face_verification'], default: 'manual' },
        ipAddress: String,
        deviceInfo: { userAgent: String, platform: String, browser: String },
        faceVerificationData: { verificationId: String, confidenceScore: Number },
        adminModified: { modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, modifiedAt: Date }
    },
    checkOut: {
        time: { type: Date, default: null },
        location: {
            latitude: Number,
            longitude: Number,
            address: { type: String, trim: true }
        },
        method: { type: String, enum: ['manual', 'qr_code', 'gps', 'biometric', 'face_verification'], default: 'manual' },
        ipAddress: String,
        deviceInfo: { userAgent: String, platform: String, browser: String },
        faceVerificationData: { verificationId: String, confidenceScore: Number },
        adminModified: { modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, modifiedAt: Date }
    },
    totalHours: { type: Number, min: 0, max: 24, default: 0 },
    breaks: [{
        startTime: Date,
        endTime: Date,
        duration: Number,
        type: { type: String, enum: ['lunch', 'coffee', 'personal', 'meeting', 'other'], default: 'other' },
        description: String
    }],
    status: { type: String, enum: ['present', 'absent', 'late', 'half_day', 'remote', 'on_leave'], default: 'present' },
    overtime: { hours: { type: Number, min: 0, default: 0 }, approved: { type: Boolean, default: false }, approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, approvedAt: Date },
    notes: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Auto-calc total hours before save
attendanceSchema.pre('save', function (next) {
    if (this.checkIn.time && this.checkOut.time) {
        this.totalHours = Math.round(((this.checkOut.time - this.checkIn.time) / (1000 * 60 * 60)) * 100) / 100;
    }
    this.breaks.forEach(b => {
        if (b.startTime && b.endTime) {
            b.duration = Math.round(((b.endTime - b.startTime) / (1000 * 60)) * 100) / 100;
        }
    });
    next();
});

// Index for faster real-time queries
attendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
