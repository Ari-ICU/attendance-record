const { CalendarEvent, WorkShift, Holiday } = require('../models/calendar.model');
const { ApiResponse } = require('../utils/apiResponse');
const { socketUtils } = require('../config/socket.config');

class CalendarController {
    // 1. Get entire calendar dashboard data (events, shifts, holidays)
    static async getDashboard(req, res) {
        try {
            const [events, shifts, holidays] = await Promise.all([
                CalendarEvent.find().sort({ date: 1, startHour: 1 }),
                WorkShift.find().sort({ startTime: 1 }),
                Holiday.find().sort({ date: 1 })
            ]);

            return res.status(200).json(ApiResponse.success({
                events,
                shifts,
                holidays
            }, 'Calendar data retrieved successfully'));
        } catch (error) {
            console.error('[CalendarController] getDashboard error:', error);
            return res.status(500).json(ApiResponse.error('Failed to fetch calendar data', 500, error.message));
        }
    }

    // 2. Events CRUD
    static async createEvent(req, res) {
        try {
            const newEvent = await CalendarEvent.create(req.body);

            // Broadcast real-time event across sockets
            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'event_created',
                    event: newEvent,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Calendar broadcast warning:', err?.message);
            }

            return res.status(201).json(ApiResponse.success(newEvent, 'Calendar event created successfully', 201));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to create calendar event', 400, error.message));
        }
    }

    static async updateEvent(req, res) {
        try {
            const updated = await CalendarEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) {
                return res.status(404).json(ApiResponse.error('Calendar event not found', 404));
            }

            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'event_updated',
                    event: updated,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Calendar broadcast warning:', err?.message);
            }

            return res.status(200).json(ApiResponse.success(updated, 'Calendar event updated successfully'));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to update calendar event', 400, error.message));
        }
    }

    static async deleteEvent(req, res) {
        try {
            const deleted = await CalendarEvent.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json(ApiResponse.error('Calendar event not found', 404));
            }

            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'event_deleted',
                    id: req.params.id,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Calendar broadcast warning:', err?.message);
            }

            return res.status(200).json(ApiResponse.success(null, 'Calendar event deleted successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to delete calendar event', 500, error.message));
        }
    }

    // 3. Shifts CRUD
    static async createShift(req, res) {
        try {
            const newShift = await WorkShift.create(req.body);

            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'shift_created',
                    shift: newShift,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Shift broadcast warning:', err?.message);
            }

            return res.status(201).json(ApiResponse.success(newShift, 'Work shift created successfully', 201));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to create shift', 400, error.message));
        }
    }

    static async updateShift(req, res) {
        try {
            const updated = await WorkShift.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updated) {
                return res.status(404).json(ApiResponse.error('Shift not found', 404));
            }

            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'shift_updated',
                    shift: updated,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Shift broadcast warning:', err?.message);
            }

            return res.status(200).json(ApiResponse.success(updated, 'Work shift updated successfully'));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to update shift', 400, error.message));
        }
    }

    static async deleteShift(req, res) {
        try {
            const deleted = await WorkShift.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json(ApiResponse.error('Shift not found', 404));
            }

            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'shift_deleted',
                    id: req.params.id,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Shift broadcast warning:', err?.message);
            }

            return res.status(200).json(ApiResponse.success(null, 'Work shift deleted successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to delete shift', 500, error.message));
        }
    }

    // 4. Holidays CRUD
    static async createHoliday(req, res) {
        try {
            const holiday = await Holiday.create(req.body);
            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'holiday_created',
                    holiday,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Holiday broadcast warning:', err?.message);
            }
            return res.status(201).json(ApiResponse.success(holiday, 'Holiday registered successfully', 201));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to create holiday', 400, error.message));
        }
    }

    static async deleteHoliday(req, res) {
        try {
            const deleted = await Holiday.findByIdAndDelete(req.params.id);
            if (!deleted) {
                return res.status(404).json(ApiResponse.error('Holiday not found', 404));
            }
            try {
                socketUtils.broadcast('calendar_updated', {
                    type: 'holiday_deleted',
                    id: req.params.id,
                    timestamp: new Date().toISOString()
                });
            } catch (err) {
                console.warn('[Socket] Holiday broadcast warning:', err?.message);
            }
            return res.status(200).json(ApiResponse.success(null, 'Holiday deleted successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to delete holiday', 500, error.message));
        }
    }
}

module.exports = CalendarController;
