const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    category: { type: String, enum: ['work', 'meeting', 'personal', 'holiday', 'special'], default: 'work' },
    date: { type: String, required: true }, // YYYY-MM-DD
    startHour: { type: Number, default: 8 },
    endHour: { type: Number, default: 9 },
    isAllDay: { type: Boolean, default: false },
    location: { type: String, trim: true, default: '' },
    description: { type: String, trim: true, default: '' },
    color: { type: String, default: 'text-emerald-950' },
    bgColor: { type: String, default: 'bg-emerald-50' },
    borderColor: { type: String, default: 'border-emerald-500' }
}, { timestamps: true });

const shiftSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['morning', 'afternoon', 'night', 'flexible'], default: 'morning' },
    startTime: { type: String, required: true, default: '08:00' },
    endTime: { type: String, required: true, default: '17:00' },
    gracePeriod: { type: Number, default: 15 },
    assignedDepts: [{ type: String, trim: true }],
    assignedCount: { type: Number, default: 0 },
    color: { type: String, default: 'text-blue-900' },
    bgColor: { type: String, default: 'bg-blue-50' }
}, { timestamps: true });

const holidaySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    type: { type: String, enum: ['national', 'academic', 'observance'], default: 'national' },
    status: { type: String, enum: ['paid', 'unpaid'], default: 'paid' }
}, { timestamps: true });

const CalendarEvent = mongoose.model('CalendarEvent', eventSchema);
const WorkShift = mongoose.model('WorkShift', shiftSchema);
const Holiday = mongoose.model('Holiday', holidaySchema);

module.exports = {
    CalendarEvent,
    WorkShift,
    Holiday
};
