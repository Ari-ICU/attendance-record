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

    static async approveBatch(month, year, userId) {
        const result = await Payroll.updateMany(
            { month, year, status: 'pending' },
            {
                $set: {
                    status: 'approved',
                    approvedBy: userId,
                    approvedAt: new Date()
                }
            }
        );
        return {
            count: result.modifiedCount,
            message: `${result.modifiedCount} payroll records approved for disbursement.`
        };
    }

    static async executeBatchDisbursement(month, year) {
        // ONLY DISBURSE APPROVED PAYROLLS
        const approvedPayrolls = await Payroll.find({ month, year, status: 'approved' }).populate('employeeId');
        const results = [];

        for (const payroll of approvedPayrolls) {
            const employee = payroll.employeeId;

            // Snapshot the destination details
            payroll.bankSnapshot = {
                bankName: employee.bankDetails?.bankName || 'CASH',
                accountName: employee.bankDetails?.accountName || employee.fullName,
                accountNumber: employee.bankDetails?.accountNumber || 'MANUAL'
            };

            payroll.status = 'disbursed';
            payroll.paymentDate = new Date();

            // Generate a unique transaction reference: PAY-YYYYMM-EMP-RANDOM
            const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
            payroll.transactionId = `PAY-${year}${String(month).padStart(2, '0')}-${employee._id.toString().slice(-4)}-${randomSuffix}`;

            await payroll.save();
            results.push(payroll);
        }

        return {
            count: results.length,
            message: `${results.length} payments executed and snapped to ledger.`
        };
    }



    static async generateMonthlyPayroll(month, year) {
        const employees = await Employee.find({ isActive: true });
        const processedRecords = [];

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const allAttendance = await Attendance.find({
            date: { $gte: startDate, $lte: endDate },
            isActive: true
        });

        // Get deduction setting or default $2 per lateness
        const LATE_PENALTY = 2;

        for (const emp of employees) {
            try {
                const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
                if (existing && (existing.status === 'disbursed' || existing.status === 'approved')) {
                    processedRecords.push(existing);
                    continue;
                }

                let baseAmount = emp.baseSalary || 0;
                let totalHours = 0;
                const empAttendance = allAttendance.filter(a => a.employeeId.toString() === emp._id.toString());

                const totalWorkDays = empAttendance.length;
                const presentDays = empAttendance.filter(a => a.status === 'present').length;
                const lateDays = empAttendance.filter(a => a.status === 'late').length;

                const complianceScore = totalWorkDays > 0 ? Math.round(((presentDays + lateDays) / totalWorkDays) * 100) : 0;

                if (emp.hourlyRate > 0) {
                    empAttendance.forEach(record => {
                        if (record.checkIn?.time && record.checkOut?.time) {
                            const durationHours = (new Date(record.checkOut.time) - new Date(record.checkIn.time)) / (1000 * 60 * 60);
                            if (durationHours > 0) totalHours += durationHours;
                        }
                    });
                    baseAmount += parseFloat((totalHours * emp.hourlyRate).toFixed(2));
                }

                const bonus = 0;
                // Calculate Lateness Deductions
                const lateDeductions = lateDays * LATE_PENALTY;
                const otherDeductions = 0;
                const totalDeductions = lateDeductions + otherDeductions;

                const netAmount = Math.max(0, baseAmount + bonus - totalDeductions);

                const payrollData = {
                    employeeId: emp._id,
                    month,
                    year,
                    baseAmount,
                    bonus,
                    deductions: totalDeductions,
                    lateDeductions,
                    netAmount,
                    status: 'pending',
                    totalHours: parseFloat(totalHours.toFixed(2)),
                    complianceScore: complianceScore || 85
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
