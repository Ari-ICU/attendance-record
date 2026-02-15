const Payroll = require('../models/payroll.model');
const Employee = require('../models/employee.model');
const Attendance = require('../models/attendance.model');
const mongoose = require('mongoose');

class PayrollService {
    static async getFinancialStats() {
        // Calculate real stats from the database
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
            efficiency: 99.8 // Placeholder for now
        };

        processedPayroll.forEach(item => {
            if (item._id === 'disbursed') stats.disbursed = item.total;
            if (item._id === 'pending') stats.pending = item.total;
            stats.totalPayroll += item.total;
        });

        return stats;
    }

    static async getPayrollLedger(month, year) {
        const employees = await Employee.find({ isActive: true });

        // Fetch existing payroll records for this period
        const payrollRecords = await Payroll.find({ month, year });
        const payrollMap = new Map(payrollRecords.map(r => [r.employeeId.toString(), r]));

        const results = await Promise.all(employees.map(async (emp) => {
            const payroll = payrollMap.get(emp._id.toString());

            // If no payroll record exists, we might show a "projected" value
            // but for ledgers, we usually want the generated records.
            return {
                employee: emp,
                payroll: payroll || {
                    baseAmount: emp.baseSalary,
                    netAmount: emp.baseSalary, // Simpler calc for now
                    status: 'pending'
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

    // Helper to generate monthly payroll for all employees
    // Helper to generate monthly payroll for all employees
    static async generateMonthlyPayroll(month, year) {
        const employees = await Employee.find({ isActive: true });
        const processedRecords = [];

        // Get start and end dates for the month to query attendance
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Fetch all attendance records for this period once to minimize DB calls
        const allAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
            status: 'present' // Only count present days
        });

        for (const emp of employees) {
            try {
                // Check if a finalized (disbursed) payroll already exists
                const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
                if (existing && existing.status === 'disbursed') {
                    continue; // Skip if already paid
                }

                let baseAmount = 0;
                let totalHours = 0;

                // Calculate Salary
                if (emp.hourlyRate > 0) {
                    // Hourly Calculation
                    const empAttendance = allAttendance.filter(a => a.employeeId.toString() === emp._id.toString());

                    // Sum up hours (assuming checkIn/checkOut exist and are valid)
                    empAttendance.forEach(record => {
                        if (record.checkIn && record.checkOut) {
                            const inTime = new Date(record.checkIn);
                            const outTime = new Date(record.checkOut);
                            const durationMs = outTime - inTime;
                            const durationHours = durationMs / (1000 * 60 * 60);
                            totalHours += durationHours;
                        }
                    });

                    baseAmount = parseFloat((totalHours * emp.hourlyRate).toFixed(2));
                } else {
                    // Fixed Monthly Salary
                    baseAmount = emp.baseSalary || 0;
                }

                // Simple Deductions/Bonuses Logic (Placeholders for now)
                const bonus = 0;
                const deductions = 0;
                const netAmount = Math.max(0, baseAmount + bonus - deductions);

                // Create or Update Payroll Record
                const payrollData = {
                    employeeId: emp._id,
                    month,
                    year,
                    baseAmount,
                    bonus,
                    deductions,
                    netAmount,
                    status: 'pending',
                    totalHours: parseFloat(totalHours.toFixed(2)) // Optional: store hours if schema supports it
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
