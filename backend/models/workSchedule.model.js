const mongoose = require('mongoose');

const workScheduleSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    shift: { type: String, enum: ['morning', 'afternoon', 'night'], required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    verifiedByRole: { type: String, enum: ['admin', 'manager'] },
    verifiedAt: { type: Date }
}, {
    timestamps: true
});


// Index for fast queries by date and shift
workScheduleSchema.index({ date: 1, shift: 1 });

module.exports = mongoose.model('WorkSchedule', workScheduleSchema);
