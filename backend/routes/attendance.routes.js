const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get attendance records
router.get('/', AttendanceController.getAttendance);
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);


module.exports = router;
