const express = require('express');
const router = express.Router();
const AttendanceController = require('../controllers/attendance.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
// Public routes (for kiosk check-in/out)
router.post('/check-in', AttendanceController.checkIn);
router.post('/check-out', AttendanceController.checkOut);

// Protected routes
router.use(authMiddleware);
router.get('/', AttendanceController.getAttendance);
router.delete('/:id', AttendanceController.deleteAttendance);


module.exports = router;
