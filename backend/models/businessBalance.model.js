const mongoose = require('mongoose');

const businessBalanceSchema = new mongoose.Schema({
    totalBudget: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    accountNumber: { type: String, trim: true }, // The company's ABA/Acleda account
    accountName: { type: String, trim: true },   // The company's registered name
    lastTopUp: { type: Date, default: Date.now },
    notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BusinessBalance', businessBalanceSchema);
