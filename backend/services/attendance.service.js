const Attendance = require('../models/attendance.model');
const EmployeeService = require('./employee.service');
const { checkInSchema, checkOutSchema, attendanceQuerySchema } = require('../validations/attendance.validation');

class AttendanceService {
    // Check-in
    static async checkIn(employee, body, ip, userAgent) {
        const { error, value } = checkInSchema.validate(body);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
            isActive: true,
        });

        if (attendance && attendance.checkIn.time) throw new Error('Already checked in');

        let faceData = null;
        if (value.method === 'face_verification') {
            if (!value.faceImage) throw new Error('Face image required for face verification');
            faceData = await EmployeeService.verifyFace(employee._id, value.faceDescriptor);
        }

        const checkInData = {
            time: new Date(),
            location: value.location || null,
            method: value.method || 'manual',
            ipAddress: ip,
            deviceInfo: { userAgent, platform: value.platform || 'unknown', browser: value.browser || 'unknown' },
            faceVerificationData: faceData,
        };

        if (attendance) {
            attendance.checkIn = checkInData;
            attendance.lastModifiedBy = employee._id;
        } else {
            attendance = new Attendance({
                employeeId: employee._id,
                date: today,
                checkIn: checkInData,
                createdBy: employee._id,
            });
        }

        await attendance.save();
        return { checkInTime: checkInData.time, faceVerificationData: faceData };
    }

    // Check-out
    static async checkOut(employee, body, ip, userAgent) {
        const { error, value } = checkOutSchema.validate(body);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
            isActive: true,
        });

        if (!attendance || !attendance.checkIn.time) throw new Error('No check-in found');
        if (attendance.checkOut.time) throw new Error('Already checked out');

        let faceData = null;
        if (value.method === 'face_verification') {
            if (!value.faceImage) throw new Error('Face image required for face verification');
            faceData = await EmployeeService.verifyFace(employee._id, value.faceDescriptor);
        }

        const checkOutData = {
            time: new Date(),
            location: value.location || null,
            method: value.method || 'manual',
            ipAddress: ip,
            deviceInfo: { userAgent, platform: value.platform || 'unknown', browser: value.browser || 'unknown' },
            faceVerificationData: faceData,
        };

        attendance.checkOut = checkOutData;
        attendance.lastModifiedBy = employee._id;
        attendance.totalHours = (checkOutData.time - attendance.checkIn.time) / (1000 * 60 * 60); // Calculate hours
        await attendance.save();

        return { checkOutTime: checkOutData.time, totalHours: attendance.totalHours, faceVerificationData: faceData };
    }

    // Fetch attendance
    static async getAttendance(employee, query) {
        const { error, value } = attendanceQuerySchema.validate(query);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const attendanceList = await Attendance.find({
            employeeId: employee._id,
            date: { $gte: value.startDate || today, $lte: value.endDate || new Date() },
            isActive: true,
        }).sort({ date: -1 });

        return attendanceList;
    }
}

module.exports = AttendanceService;