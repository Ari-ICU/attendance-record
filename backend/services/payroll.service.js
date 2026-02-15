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
    static async generateMonthlyPayroll(month, year) {
        const employees = await Employee.find({ isActive: true });
        const createdRecords = [];

        for (const emp of employees) {
            try {
                // Check if already exists
                const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
                if (existing) continue;

                // Simple logic: Base salary
                const netAmount = emp.baseSalary;

                const payroll = new Payroll({
                    employeeId: emp._id,
                    month,
                    year,
                    baseAmount: emp.baseSalary,
                    netAmount,
                    status: 'pending'
                });

                await payroll.save();
                createdRecords.push(payroll);
            } catch (err) {
                console.error(`Failed to generate payroll for ${emp.fullName}:`, err);
            }
        }
        return createdRecords;
    }
}

module.exports = PayrollService;
