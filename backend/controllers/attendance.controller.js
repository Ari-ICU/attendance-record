const AttendanceService = require('../services/attendance.service');
const { ApiResponse } = require('../utils/apiResponse');

class AttendanceController {
    // Get attendance records (for admin/employee)
    static async getAttendance(req, res) {
        try {
            const result = await AttendanceService.getAttendance(req.user, req.query);
            return res.status(200).json(ApiResponse.success(result, 'Attendance records retrieved successfully', 200));
        } catch (err) {
            console.error('Error in getAttendance:', err);
            return res.status(400).json(ApiResponse.error('Failed to get attendance records', 400, err.message));
        }
    }
}

module.exports = AttendanceController;
