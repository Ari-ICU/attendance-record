const express = require('express');
const router = express.Router();
const CalendarController = require('../controllers/calendar.controller');

// Dashboard data
router.get('/', CalendarController.getDashboard);

// Events
router.post('/events', CalendarController.createEvent);
router.put('/events/:id', CalendarController.updateEvent);
router.delete('/events/:id', CalendarController.deleteEvent);

// Shifts
router.post('/shifts', CalendarController.createShift);
router.put('/shifts/:id', CalendarController.updateShift);
router.delete('/shifts/:id', CalendarController.deleteShift);

// Holidays
router.post('/holidays', CalendarController.createHoliday);
router.delete('/holidays/:id', CalendarController.deleteHoliday);

module.exports = router;
