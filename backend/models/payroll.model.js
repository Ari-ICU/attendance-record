const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
    baseSalary: { type: Number, default: 0 },
    hourlyRate: { type: Number, default: 0 },
    regularHours: { type: Number, default: 160 },
    workedHours: { type: Number, default: 0 },
    workingDays: { type: Number, default: 0 },
    targetDays: { type: Number, default: 22 },
    presentDays: { type: Number, default: 0 },
    regularPay: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    overtimePay: { type: Number, default: 0 },
    bonuses: { type: Number, default: 0 },
    allowances: { type: Number, default: 0 },
    grossEarnings: { type: Number, default: 0 }
}, { _id: false });

const deductionsSchema = new mongoose.Schema({
    lateCount: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    lateDeductions: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    absentDeductions: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    permissionDays: { type: Number, default: 0 },
    unpaidLeaveDays: { type: Number, default: 0 },
    leaveDeductions: { type: Number, default: 0 },
    taxWithholding: { type: Number, default: 0 },
    socialSecurity: { type: Number, default: 0 },
    otherDeductions: { type: Number, default: 0 },
    totalDeductions: { type: Number, default: 0 }
}, { _id: false });

const attendanceMetricsSchema = new mongoose.Schema({
    totalWorkingHours: { type: Number, default: 0 },
    targetWorkingHours: { type: Number, default: 160 },
    targetDays: { type: Number, default: 22 },
    presentDays: { type: Number, default: 0 },
    lateDays: { type: Number, default: 0 },
    lateMinutes: { type: Number, default: 0 },
    absentDays: { type: Number, default: 0 },
    leaveDays: { type: Number, default: 0 },
    permissionDays: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    attendanceRate: { type: Number, default: 100 }
}, { _id: false });

const payrollSchema = new mongoose.Schema({
    payrollId: { type: String },
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: { type: String, required: true }, // "September" or "9"
    monthNumber: { type: Number, default: 9 }, // 1-12
    year: { type: Number, required: true, default: 2026 },
    payPeriodStart: { type: String, default: '2026-09-01' },
    payPeriodEnd: { type: String, default: '2026-09-30' },
    paymentDate: { type: String, default: '2026-09-30' },
    earnings: { type: earningsSchema, default: () => ({}) },
    deductions: { type: deductionsSchema, default: () => ({}) },
    attendanceMetrics: { type: attendanceMetricsSchema, default: () => ({}) },
    netPay: { type: Number, required: true, default: 0 },
    baseAmount: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    lateDeductions: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: ['pending', 'processing', 'paid', 'approved', 'disbursed', 'on_hold', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        default: 'Direct Deposit / Bank Wire'
    },
    bankDetails: {
        bankName: { type: String, trim: true },
        accountName: { type: String, trim: true },
        accountNumber: { type: String, trim: true }
    },
    bankSnapshot: {
        bankName: String,
        accountName: String,
        accountNumber: String
    },
    transactionId: { type: String },
    complianceScore: { type: Number, default: 95 },
    notes: { type: String },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    generatedAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for populated employee object
payrollSchema.virtual('employee', {
    ref: 'Employee',
    localField: 'employeeId',
    foreignField: '_id',
    justOne: true
});

module.exports = mongoose.model('Payroll', payrollSchema);
