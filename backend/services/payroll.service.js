const Payroll = require('../models/payroll.model');
const Employee = require('../models/employee.model');
const BusinessBalance = require('../models/businessBalance.model');

class PayrollService {
    static async topUpMasterBalance(amount, notes = 'Manual Top-up') {
        let balanceDoc = await BusinessBalance.findOne();
        if (!balanceDoc) {
            balanceDoc = new BusinessBalance({ totalBudget: 0 });
        }

        balanceDoc.totalBudget += parseFloat(amount);
        balanceDoc.lastTopUp = new Date();
        balanceDoc.notes = notes;

        await balanceDoc.save();
        return balanceDoc;
    }

    static async updateCompanyBankDetails(details) {
        let balanceDoc = await BusinessBalance.findOne();
        if (!balanceDoc) {
            balanceDoc = new BusinessBalance({ totalBudget: 0 });
        }

        balanceDoc.accountNumber = details.accountNumber;
        balanceDoc.accountName = details.accountName;
        balanceDoc.bankName = details.bankName;

        await balanceDoc.save();
        return balanceDoc;
    }

    static async getFinancialStats() {
        const payslips = await Payroll.find();
        
        let totalPayroll = 0;
        let disbursed = 0;
        let pending = 0;

        payslips.forEach(p => {
            const amount = p.netPay || p.netAmount || 0;
            totalPayroll += amount;
            if (p.status === 'paid' || p.status === 'disbursed') {
                disbursed += amount;
            } else {
                pending += amount;
            }
        });

        let balanceDoc = await BusinessBalance.findOne();
        if (!balanceDoc) {
            balanceDoc = await BusinessBalance.create({ totalBudget: 150000 });
        }

        const stats = {
            totalPayroll: Math.round(totalPayroll * 100) / 100,
            disbursed: Math.round(disbursed * 100) / 100,
            pending: Math.round(pending * 100) / 100,
            masterBalance: balanceDoc.totalBudget,
            ownerResidual: Math.max(0, balanceDoc.totalBudget - disbursed),
            efficiency: totalPayroll > 0 ? parseFloat(((disbursed / totalPayroll) * 100).toFixed(1)) : 98.5
        };

        return stats;
    }

    static async getMonthlyPayroll(month = 'September', year = 2026) {
        let queryMonth = month;
        if (typeof month === 'number') {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            queryMonth = monthNames[month] || 'September';
        }

        const payslips = await Payroll.find({
            $or: [
                { month: queryMonth, year: parseInt(year) },
                { month: new RegExp(`^${queryMonth}$`, 'i'), year: parseInt(year) }
            ]
        }).populate('employeeId');

        // Normalize payslips format
        const formatted = payslips.map(p => {
            const obj = p.toObject();
            obj.employee = obj.employeeId;
            return obj;
        });

        const totalGrossSalary = formatted.reduce((acc, p) => acc + (p.earnings?.grossEarnings || p.baseAmount || 0), 0);
        const totalOvertimePay = formatted.reduce((acc, p) => acc + (p.earnings?.overtimePay || 0), 0);
        const totalDeductions = formatted.reduce((acc, p) => acc + (p.deductions?.totalDeductions || p.deductions || 0), 0);
        const totalNetPayout = formatted.reduce((acc, p) => acc + (p.netPay || p.netAmount || 0), 0);

        return {
            month: queryMonth,
            year: parseInt(year),
            totalStaffCount: formatted.length,
            totalGrossSalary: Math.round(totalGrossSalary * 100) / 100,
            totalOvertimePay: Math.round(totalOvertimePay * 100) / 100,
            totalDeductions: Math.round(totalDeductions * 100) / 100,
            totalNetPayout: Math.round(totalNetPayout * 100) / 100,
            status: formatted.length > 0 && formatted.every(p => p.status === 'paid' || p.status === 'disbursed') ? 'disbursed' : 'processed',
            payslips: formatted
        };
    }

    static async getPayrollLedger(month = 9, year = 2026) {
        return await PayrollService.getMonthlyPayroll(month, year);
    }

    static async getPayslipById(id) {
        const payslip = await Payroll.findById(id).populate('employeeId');
        if (!payslip) return null;
        const obj = payslip.toObject();
        obj.employee = obj.employeeId;
        return obj;
    }

    static async getEmployeePayslips(employeeId) {
        const payslips = await Payroll.find({ employeeId }).populate('employeeId');
        return payslips.map(p => {
            const obj = p.toObject();
            obj.employee = obj.employeeId;
            return obj;
        });
    }

    static async updatePayslipStatus(id, status) {
        const payslip = await Payroll.findByIdAndUpdate(
            id,
            { status, ...(status === 'paid' ? { paymentDate: new Date().toISOString().split('T')[0] } : {}) },
            { new: true }
        ).populate('employeeId');

        if (!payslip) return null;
        const obj = payslip.toObject();
        obj.employee = obj.employeeId;
        return obj;
    }

    static async markAllAsPaid(month = 'September', year = 2026) {
        let queryMonth = month;
        if (typeof month === 'number') {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            queryMonth = monthNames[month] || 'September';
        }

        await Payroll.updateMany(
            {
                $or: [
                    { month: queryMonth, year: parseInt(year) },
                    { month: new RegExp(`^${queryMonth}$`, 'i'), year: parseInt(year) }
                ]
            },
            { status: 'paid', paymentDate: new Date().toISOString().split('T')[0] }
        );

        return true;
    }

    static async generateMonthlyPayroll(month = 'September', year = 2026) {
        let queryMonth = month;
        let monthNum = 9;
        if (typeof month === 'number') {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            monthNum = month;
            queryMonth = monthNames[month] || 'September';
        }

        const employees = await Employee.find({ isActive: true });
        
        // Remove existing for this month
        await Payroll.deleteMany({
            $or: [
                { month: queryMonth, year: parseInt(year) },
                { month: new RegExp(`^${queryMonth}$`, 'i'), year: parseInt(year) }
            ]
        });

        const createdDocs = [];
        for (let idx = 0; idx < employees.length; idx++) {
            const emp = employees[idx];
            const baseSalary = emp.baseSalary || 2000;
            const hourlyRate = emp.hourlyRate || 20;
            const overtimeHours = (idx % 2 === 0) ? (idx * 2 + 2) : 0;
            const overtimeRate = hourlyRate * 1.5;
            const overtimePay = overtimeHours * overtimeRate;
            const bonuses = idx === 0 ? 150 : 50;
            const allowances = 80;
            const grossEarnings = baseSalary + overtimePay + bonuses + allowances;

            const taxWithholding = Math.round(grossEarnings * 0.05 * 100) / 100;
            const socialSecurity = Math.round(grossEarnings * 0.02 * 100) / 100;
            const totalDeductions = taxWithholding + socialSecurity;
            const netPay = Math.round((grossEarnings - totalDeductions) * 100) / 100;

            const newPayroll = await Payroll.create({
                payrollId: `pr_${year}_${monthNum < 10 ? '0' + monthNum : monthNum}`,
                employeeId: emp._id,
                month: queryMonth,
                monthNumber: monthNum,
                year: parseInt(year),
                payPeriodStart: `${year}-${monthNum < 10 ? '0' + monthNum : monthNum}-01`,
                payPeriodEnd: `${year}-${monthNum < 10 ? '0' + monthNum : monthNum}-30`,
                paymentDate: `${year}-${monthNum < 10 ? '0' + monthNum : monthNum}-30`,
                earnings: {
                    baseSalary,
                    hourlyRate,
                    regularHours: 160,
                    regularPay: baseSalary,
                    overtimeHours,
                    overtimeRate,
                    overtimePay,
                    bonuses,
                    allowances,
                    grossEarnings,
                },
                deductions: {
                    unpaidLeaveDays: 0,
                    leaveDeductions: 0,
                    taxWithholding,
                    socialSecurity,
                    otherDeductions: 0,
                    totalDeductions,
                },
                netPay,
                baseAmount: baseSalary,
                netAmount: netPay,
                status: 'pending',
                paymentMethod: 'Direct Deposit / Bank Wire',
                bankDetails: emp.bankDetails || {
                    bankName: 'ABA Bank',
                    accountName: `${emp.firstName.toUpperCase()} ${emp.lastName.toUpperCase()}`,
                    accountNumber: `00${idx + 1} 123 456`
                },
                complianceScore: 95 + (idx % 5)
            });

            createdDocs.push(newPayroll);
        }

        return await PayrollService.getMonthlyPayroll(queryMonth, year);
    }

    static async executeBatchDisbursement(month, year) {
        await PayrollService.markAllAsPaid(month, year);
        return { success: true, message: 'All payslips disbursed successfully' };
    }

    static async approveBatch(month, year, userId) {
        let queryMonth = month;
        if (typeof month === 'number') {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            queryMonth = monthNames[month] || 'September';
        }

        await Payroll.updateMany(
            {
                $or: [
                    { month: queryMonth, year: parseInt(year) },
                    { month: new RegExp(`^${queryMonth}$`, 'i'), year: parseInt(year) }
                ]
            },
            { status: 'approved', approvedBy: userId, approvedAt: new Date() }
        );

        return { success: true, message: 'Payroll approved' };
    }
}

module.exports = PayrollService;
