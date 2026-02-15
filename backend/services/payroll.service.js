const Payroll = require('../models/payroll.model');
const Employee = require('../models/employee.model');
const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

class PayrollService {
    static async getFinancialStats() {
        const processedPayroll = await Payroll.aggregate([
            {
                $group: {
                    _id: '$status',
                    total: { $sum: '$netAmount' }
                }
            }
        ]);

        const stats = {
            totalPayroll: 0,
            disbursed: 0,
            pending: 0,
            efficiency: 99.8
        };

        processedPayroll.forEach(item => {
            if (item._id === 'disbursed') stats.disbursed = item.total;
            if (item._id === 'pending') stats.pending = item.total;
            stats.totalPayroll += item.total;
        });

        // Dynamic efficiency based on disbursed vs total
        if (stats.totalPayroll > 0) {
            stats.efficiency = parseFloat(((stats.disbursed / stats.totalPayroll) * 100).toFixed(1));
        }

        return stats;
    }

    static async getPayrollLedger(month, year) {
        const employees = await Employee.find({ isActive: true });
        const payrollRecords = await Payroll.find({ month, year });
        const payrollMap = new Map(payrollRecords.map(r => [r.employeeId.toString(), r]));

        const results = await Promise.all(employees.map(async (emp) => {
            const payroll = payrollMap.get(emp._id.toString());

            // Calculate a temporary compliance score if no record exists
            const complianceScore = payroll ? (payroll.complianceScore || 0) : 85;

            return {
                employee: emp,
                payroll: payroll ? payroll.toObject() : {
                    baseAmount: emp.baseSalary || 0,
                    netAmount: emp.baseSalary || 0,
                    status: 'pending',
                    complianceScore: 0
                }
            };
        }));

        return results;
    }

    static async executeBatchDisbursement(month, year) {
        const result = await Payroll.updateMany(
            { month, year, status: 'pending' },
            {
                $set: {
                    status: 'disbursed',
                    paymentDate: new Date()
                }
            }
        );
        return result;
    }

    static async generateMonthlyPayroll(month, year) {
        const employees = await Employee.find({ isActive: true });
        const processedRecords = [];

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const allAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate }
        });

        for (const emp of employees) {
            try {
                const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
                if (existing && existing.status === 'disbursed') {
                    processedRecords.push(existing);
                    continue;
                }

                let baseAmount = emp.baseSalary || 0;
                let totalHours = 0;
                const empAttendance = allAttendance.filter(a => a.employeeId.toString() === emp._id.toString());

                // Compliance Score calculation based on "present" vs total workdays
                const totalWorkDays = empAttendance.length;
                const presentDays = empAttendance.filter(a => a.status === 'present').length;
                const complianceScore = totalWorkDays > 0 ? Math.round((presentDays / totalWorkDays) * 100) : 0;

                if (emp.hourlyRate > 0) {
                    empAttendance.forEach(record => {
                        if (record.checkIn?.time && record.checkOut?.time) {
                            const durationHours = (new Date(record.checkOut.time) - new Date(record.checkIn.time)) / (1000 * 60 * 60);
                            if (durationHours > 0) totalHours += durationHours;
                        }
                    });

                    const hourlyEarnings = parseFloat((totalHours * emp.hourlyRate).toFixed(2));
                    // Add hourly earnings to base salary (allows for base + commission/overtime models)
                    // If they are purely hourly, they should set baseSalary to 0
                    baseAmount += hourlyEarnings;
                }

                const bonus = 0;
                const deductions = 0;
                const netAmount = Math.max(0, baseAmount + bonus - deductions);

                const payrollData = {
                    employeeId: emp._id,
                    month,
                    year,
                    baseAmount,
                    bonus,
                    deductions,
                    netAmount,
                    status: 'pending',
                    totalHours: parseFloat(totalHours.toFixed(2)),
                    complianceScore: complianceScore || 85 // fallback to 85 if they exist but no attendance yet
                };

                const payroll = await Payroll.findOneAndUpdate(
                    { employeeId: emp._id, month, year },
                    payrollData,
                    { new: true, upsert: true }
                );

                processedRecords.push(payroll);
            } catch (err) {
                console.error(`Failed to generate payroll for ${emp.fullName}:`, err);
            }
        }
        return processedRecords;
    }
}

module.exports = PayrollService;
