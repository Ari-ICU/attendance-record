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

    static async getLedger(req, res) {
        try {
            const { month, year } = req.query;
            const now = new Date();
            const targetMonth = parseInt(month) || now.getMonth() + 1;
            const targetYear = parseInt(year) || now.getFullYear();

            const ledger = await PayrollService.getPayrollLedger(targetMonth, targetYear);
            res.json(ApiResponse.success(ledger));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async disburse(req, res) {
        try {
            const { month, year } = req.body;
            const now = new Date();
            const targetMonth = parseInt(month) || now.getMonth() + 1;
            const targetYear = parseInt(year) || now.getFullYear();

            const result = await PayrollService.executeBatchDisbursement(targetMonth, targetYear);
            res.json(ApiResponse.success(result, 'Batch disbursement sequence completed'));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async approve(req, res) {
        try {
            const { month, year } = req.body;
            const now = new Date();
            const targetMonth = parseInt(month) || now.getMonth() + 1;
            const targetYear = parseInt(year) || now.getFullYear();

            const result = await PayrollService.approveBatch(targetMonth, targetYear, req.user._id);
            res.json(ApiResponse.success(result));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }

    static async generate(req, res) {
        try {
            const { month, year } = req.body;
            const now = new Date();
            const targetMonth = parseInt(month) || now.getMonth() + 1;
            const targetYear = parseInt(year) || now.getFullYear();

            const created = await PayrollService.generateMonthlyPayroll(targetMonth, targetYear);
            res.json(ApiResponse.success(created, `Generated ${created.length} payroll records`));
        } catch (error) {
            res.status(500).json(ApiResponse.error(error.message));
        }
    }
}

module.exports = PayrollController;
