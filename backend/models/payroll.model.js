const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    baseAmount: { type: Number, required: true, default: 0 },
    bonus: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    netAmount: { type: Number, required: true, default: 0 },
    lateDeductions: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'approved', 'disbursed', 'failed'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },
    paymentDate: { type: Date },
    paymentMethod: { type: String, enum: ['bank_transfer', 'cash', 'cheque'], default: 'bank_transfer' },
    transactionId: { type: String },
    complianceScore: { type: Number, default: 0 },
    bankSnapshot: {
        bankName: String,
        accountName: String,
        accountNumber: String
    },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// Index for efficient lookup
payrollSchema.index({ employeeId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
