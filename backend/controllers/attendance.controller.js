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
            const EmployeeModel = require('../models/employee.model');

            let targetEmployee = null;
            const { employeeId } = req.body;

            // 1. Resolve Target Employee
            if (employeeId) {
                targetEmployee = await EmployeeModel.findById(employeeId);
            } else {
                targetEmployee = await EmployeeModel.findOne({ email: req.user.email });
            }

            if (!targetEmployee) {
                return res.status(404).json(ApiResponse.error('Biometric record not found for this identity', 404));
            }

            // 2. Security Check: Non-admins can only check-in/out for themselves
            const isAdmin = req.user.role === 'admin';
            const isSelf = targetEmployee.email?.toLowerCase() === req.user.email?.toLowerCase();

            console.log(`[Security] User ${req.user.email} (Role: ${req.user.role}) targetting ${targetEmployee.email}. isAdmin: ${isAdmin}, isSelf: ${isSelf}`);

            if (!isAdmin && !isSelf) {
                return res.status(403).json(ApiResponse.error('Unauthorized: You can only verify your own attendance', 403));
            }

            const result = await AttendanceService.checkIn(targetEmployee, req.body, ip, userAgent);
            return res.status(200).json(ApiResponse.success(result, 'Check-in successful', 200));
        } catch (err) {
            console.error('Error in checkIn:', err);
            return res.status(400).json(ApiResponse.error(err.message || 'Failed to check in', 400));
        }
    }

    // Check-out
    static async checkOut(req, res) {
        try {
            const ip = req.clientIp || req.ip;
            const userAgent = req.get('User-Agent');
            const EmployeeModel = require('../models/employee.model');

            let targetEmployee = null;
            const { employeeId } = req.body;

            if (employeeId) {
                targetEmployee = await EmployeeModel.findById(employeeId);
            } else {
                targetEmployee = await EmployeeModel.findOne({ email: req.user.email });
            }

            if (!targetEmployee) {
                return res.status(404).json(ApiResponse.error('Biometric record not found for this identity', 404));
            }

            const isAdmin = req.user.role === 'admin';
            const isSelf = targetEmployee.email?.toLowerCase() === req.user.email?.toLowerCase();

            console.log(`[Security/Out] User ${req.user.email} (Role: ${req.user.role}) targetting ${targetEmployee.email}. isAdmin: ${isAdmin}, isSelf: ${isSelf}`);

            if (!isAdmin && !isSelf) {
                return res.status(403).json(ApiResponse.error('Unauthorized: You can only verify your own attendance', 403));
            }

            const result = await AttendanceService.checkOut(targetEmployee, req.body, ip, userAgent);
            return res.status(200).json(ApiResponse.success(result, 'Check-out successful', 200));
        } catch (err) {
            console.error('Error in checkOut:', err);
            return res.status(400).json(ApiResponse.error(err.message || 'Failed to check out', 400));
        }
    }
}

module.exports = AttendanceController;
