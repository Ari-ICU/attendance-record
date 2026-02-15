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
    // Check-in
    static async checkIn(req, res) {
        try {
            const ip = req.clientIp || req.ip;
            const userAgent = req.get('User-Agent');
            let employee = req.user;

            // Allow admin to check in for other employees
            if (req.user.role === 'admin' && req.body.employeeId) {
                // You might need to fetch the employee object here
                // For now, let's assume the service handles specific employee logic or we fetch it:
                const EmployeeService = require('../services/employee.service');
                employee = await EmployeeService.getEmployeeById(req.body.employeeId);
            }

            const result = await AttendanceService.checkIn(employee, req.body, ip, userAgent);
            return res.status(200).json(ApiResponse.success(result, 'Check-in successful', 200));
        } catch (err) {
            console.error('Error in checkIn:', err);
            return res.status(400).json(ApiResponse.error('Failed to check in', 400, err.message));
        }
    }

    // Check-out
    static async checkOut(req, res) {
        try {
            const ip = req.clientIp || req.ip;
            const userAgent = req.get('User-Agent');
            let employee = req.user;

            if (req.user.role === 'admin' && req.body.employeeId) {
                const EmployeeService = require('../services/employee.service');
                employee = await EmployeeService.getEmployeeById(req.body.employeeId);
            }

            const result = await AttendanceService.checkOut(employee, req.body, ip, userAgent);
            return res.status(200).json(ApiResponse.success(result, 'Check-out successful', 200));
        } catch (err) {
            console.error('Error in checkOut:', err);
            return res.status(400).json(ApiResponse.error('Failed to check out', 400, err.message));
        }
    }
}

module.exports = AttendanceController;
