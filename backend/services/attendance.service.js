const Attendance = require('../models/attendance.model');
const EmployeeService = require('./employee.service');
const systemSettingService = require('./systemSetting.service');
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

        if (attendance && attendance.checkIn.time) throw new Error('You have already checked in for today.');

        let faceData = null;
        if (value.method === 'face_verification') {
            if (!value.faceImage && !value.faceDescriptor) throw new Error('Face image or descriptor required for face verification');
            const faceInput = value.faceDescriptor || value.faceImage;
            faceData = await EmployeeService.verifyFace(employee._id, faceInput);
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

        // Logic for marking LATE based on settings
        try {
            const workStartTimeStr = await systemSettingService.getSetting('work_start_time') || '08:00';
            const gracePeriod = await systemSettingService.getSetting('grace_period_minutes') || 0;

            const [hours, minutes] = workStartTimeStr.split(':').map(Number);
            const workStart = new Date(checkInData.time);
            workStart.setHours(hours, minutes, 0, 0);

            // Add grace period
            const threshold = new Date(workStart.getTime() + gracePeriod * 60000);

            if (checkInData.time > threshold) {
                attendance.status = 'late';
            } else {
                attendance.status = 'present';
            }
        } catch (settingsErr) {
            console.error('Error fetching settings for late check:', settingsErr);
            attendance.status = 'present'; // Default
        }

        await attendance.save();
        return { checkInTime: checkInData.time, faceVerificationData: faceData, status: attendance.status };

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
        if (attendance.checkOut.time) throw new Error('You have already checked out for today.');

        let faceData = null;
        if (value.method === 'face_verification') {
            if (!value.faceImage && !value.faceDescriptor) throw new Error('Face image or descriptor required for face verification');
            const faceInput = value.faceDescriptor || value.faceImage;
            faceData = await EmployeeService.verifyFace(employee._id, faceInput);
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
    static async getAttendance(user, query) {
        // const { error, value } = attendanceQuerySchema.validate(query);
        // if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        const filter = { isActive: true };

        // Date Filtering
        if (query.startDate && query.endDate) {
            const start = new Date(query.startDate);
            const end = new Date(query.endDate);
            end.setHours(23, 59, 59, 999);

            filter.date = {
                $gte: start,
                $lte: end
            };
        } else if (query.startDate) {
            const start = new Date(query.startDate);
            filter.date = { $gte: start };
        } else {
            // Default to today if no date provided? Or maybe last 30 days?
            // For now, let's not enforce a default date filter if they want everything, 
            // but for performance, maybe default to current month or similar.
            // Let's stick to the user's request: "record for a day".
            // If they pass a specific date (like today), we handle it.
            // If no date, maybe return recent ones.
        }

        // Employee Filtering
        if (user.role === 'admin') {
            if (query.employeeId) {
                filter.employeeId = query.employeeId;
            }
            // If admin and no employeeId, return all (subject to date filter)
        } else {
            // Non-admin can only see their own
            filter.employeeId = user._id;
        }

        // Special handling for "today" convenience if needed, 
        // but typically frontend passes startDate=today&endDate=today

        // Populate employee details for admin view
        const attendanceList = await Attendance.find(filter)
            .populate('employeeId', 'firstName lastName email photoUrl position department')
            .sort({ 'checkIn.time': -1 });

        return attendanceList;
    }
}

module.exports = AttendanceService;