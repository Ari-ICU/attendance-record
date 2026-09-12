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

        // 1. Check for any unclosed sessions from PREVIOUS days
        const unclosedSession = await Attendance.findOne({
            employeeId: employee._id,
            date: { $lt: today },
            'checkIn.time': { $ne: null },
            'checkOut.time': null,
            isActive: true
        });

        if (unclosedSession) {
            console.log(`[Attendance] Closing stale session from ${unclosedSession.date} for ${employee.email}`);
            // Auto-checkout at end of its day or a standard time? 
            // Let's use 23:59:59 of that day or just 8 hours after check-in.
            // For simplicity, let's close it at 23:59:59 of that day.
            const checkoutTime = new Date(unclosedSession.date);
            checkoutTime.setHours(23, 59, 59, 999);

            unclosedSession.checkOut = {
                time: checkoutTime,
                method: 'system_auto',
                ipAddress: '127.0.0.1',
                deviceInfo: { userAgent: 'System Auto-Checkout', platform: 'server', browser: 'none' }
            };
            unclosedSession.status = unclosedSession.status || 'present';
            await unclosedSession.save();
        }

        // 2. Now check for today's record
        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date: { $gte: today, $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000) },
            isActive: true,
        });

        if (attendance && attendance.checkIn && attendance.checkIn.time) {
            throw new Error('You have already checked in for today.');
        }

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
            const [workStartTimeStr, gracePeriod] = await Promise.all([
                systemSettingService.getSetting('work_start_time'),
                systemSettingService.getSetting('grace_period_minutes')
            ]);

            const [hours, minutes] = (workStartTimeStr || '08:00').split(':').map(Number);
            const workStart = new Date(checkInData.time);
            workStart.setHours(hours, minutes, 0, 0);

            // Add grace period
            const threshold = new Date(workStart.getTime() + (parseInt(gracePeriod) || 0) * 60000);

            attendance.status = checkInData.time > threshold ? 'late' : 'present';
        } catch (settingsErr) {
            console.error('Error fetching settings for late check:', settingsErr);
            attendance.status = 'present';
        }

        await attendance.save();
        return { checkInTime: checkInData.time, faceVerificationData: faceData, status: attendance.status };

    }

    // Check-out
    static async checkOut(employee, body, ip, userAgent) {
        const { error, value } = checkOutSchema.validate(body);
        if (error) throw new Error(`Validation failed: ${error.details[0].message}`);

        // Look for the most recent check-in that doesn't have a check-out
        // This supports night shifts (e.g., check-in at 11PM, check-out at 2AM)
        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            'checkIn.time': { $ne: null },
            'checkOut.time': null,
            isActive: true,
        }).sort({ 'checkIn.time': -1 });

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
        }

        // Employee Filtering
        if (user.role === 'admin') {
            if (query.employeeId) {
                filter.employeeId = query.employeeId;
            }
        } else {
            filter.employeeId = user._id;
        }

        // Status Filtering
        if (query.status) {
            filter.status = query.status;
        }

        // Use .lean() for faster read-only queries
        return await Attendance.find(filter)
            .populate('employeeId', 'firstName lastName email photoUrl position department')
            .sort({ 'checkIn.time': -1 })
            .lean();
    }


    // Delete attendance record
    static async deleteRecord(id) {
        const result = await Attendance.findByIdAndDelete(id);
        if (!result) throw new Error('Attendance record not found');
        return result;
    }
}

module.exports = AttendanceService;