const ReportService = require('../services/report.service');
const { ApiResponse } = require('../utils/apiResponse');

class ReportController {
    static async getAnalytics(req, res) {
        try {
            const { timeRange } = req.query;
            const data = await ReportService.getAnalytics(timeRange);
            return res.status(200).json(ApiResponse.success(data, 'Analytics retrieved successfully'));
        } catch (error) {
            console.error('Error in getAnalytics:', error);
            return res.status(500).json(ApiResponse.error('Failed to fetch analytics', 500, error.message));
        }
    }
}

module.exports = ReportController;
