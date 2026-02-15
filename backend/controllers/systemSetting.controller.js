const systemSettingService = require('../services/systemSetting.service');
const { ApiResponse } = require('../utils/apiResponse');

class SystemSettingController {
    async getSettings(req, res) {
        try {
            const settings = await systemSettingService.getAllSettings();
            return res.status(200).json(ApiResponse.success(settings, 'Settings retrieved successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to retrieve settings', 500, error.message));
        }
    }

    async updateSettings(req, res) {
        try {
            const settings = req.body;
            const promises = Object.entries(settings).map(([key, value]) =>
                systemSettingService.updateSetting(key, value, req.user._id)
            );
            await Promise.all(promises);
            const updatedSettings = await systemSettingService.getAllSettings();
            return res.status(200).json(ApiResponse.success(updatedSettings, 'Settings updated successfully'));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to update settings', 400, error.message));
        }
    }
}

module.exports = new SystemSettingController();
