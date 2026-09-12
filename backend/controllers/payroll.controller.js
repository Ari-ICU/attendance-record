const PayrollService = require('../services/payroll.service');
const { ApiResponse } = require('../utils/apiResponse');

class PayrollController {
    static async getStats(req, res) {
        try {
            const stats = await PayrollService.getFinancialStats();
            res.json(ApiResponse.success(stats));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async getMonthly(req, res) {
        try {
            const { month, year } = req.query;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            const data = await PayrollService.getMonthlyPayroll(targetMonth, targetYear);
            res.json(ApiResponse.success(data));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async getLedger(req, res) {
        try {
            const { month, year } = req.query;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            const data = await PayrollService.getMonthlyPayroll(targetMonth, targetYear);
            res.json(ApiResponse.success(data));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async getPayslipById(req, res) {
        try {
            const payslip = await PayrollService.getPayslipById(req.params.id);
            if (!payslip) {
                return res.status(404).json(ApiResponse.error('Payslip not found', 404));
            }
            res.json(ApiResponse.success(payslip));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async getEmployeePayslips(req, res) {
        try {
            const payslips = await PayrollService.getEmployeePayslips(req.params.employeeId);
            res.json(ApiResponse.success(payslips));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async updatePayslipStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const updated = await PayrollService.updatePayslipStatus(id, status);
            if (!updated) {
                return res.status(404).json(ApiResponse.error('Payslip not found', 404));
            }
            res.json(ApiResponse.success(updated, 'Payslip status updated'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async markAllAsPaid(req, res) {
        try {
            const { month, year } = req.body;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            await PayrollService.markAllAsPaid(targetMonth, targetYear);
            res.json(ApiResponse.success(null, 'All payslips marked as paid'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async disburse(req, res) {
        try {
            const { month, year } = req.body;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            const result = await PayrollService.executeBatchDisbursement(targetMonth, targetYear);
            res.json(ApiResponse.success(result, 'Batch disbursement sequence completed'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async approve(req, res) {
        try {
            const { month, year } = req.body;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            const result = await PayrollService.approveBatch(targetMonth, targetYear, req.user._id);
            res.json(ApiResponse.success(result));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async topUp(req, res) {
        try {
            const { amount, notes } = req.body;
            if (!amount || amount <= 0) throw new Error('Invalid deposit amount');

            const result = await PayrollService.topUpMasterBalance(amount, notes);
            res.json(ApiResponse.success(result, `Successfully deposited $${amount} to vault`));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async updateBankDetails(req, res) {
        try {
            const result = await PayrollService.updateCompanyBankDetails(req.body);
            res.json(ApiResponse.success(result, 'Company bank credentials synchronized'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async generate(req, res) {
        try {
            const { month, year } = req.body;
            const targetMonth = month || 'September';
            const targetYear = parseInt(year) || 2026;

            const created = await PayrollService.generateMonthlyPayroll(targetMonth, targetYear);
            res.json(ApiResponse.success(created, `Generated monthly payroll`));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }
}

module.exports = PayrollController;
