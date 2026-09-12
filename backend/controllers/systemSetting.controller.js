const systemSettingService = require('../services/systemSetting.service');
const { ApiResponse } = require('../utils/apiResponse');
const crypto = require('crypto');

class SystemSettingController {
    async getSettings(req, res) {
        try {
            const rawSettings = await systemSettingService.getAllSettings();
            
            // Format structured settings for frontend
            const settings = {
                companyName: rawSettings.companyName || 'StaffFlow Enterprise Systems',
                workHours: rawSettings.workHours || {
                    startTime: rawSettings.work_start_time || '08:00',
                    endTime: rawSettings.work_end_time || '17:00',
                    gracePeriod: rawSettings.grace_period_minutes || 15,
                    halfDayThreshold: 4,
                },
                geofence: rawSettings.geofence || {
                    enabled: true,
                    latitude: rawSettings.office_latitude || 11.5564,
                    longitude: rawSettings.office_longitude || 104.9282,
                    radius: rawSettings.geofence_range_meters || 250,
                    strictMode: false,
                },
                notifications: rawSettings.notifications || {
                    emailAlerts: true,
                    lateCheckInNotice: true,
                    systemHealth: true,
                }
            };

            return res.status(200).json(ApiResponse.success(settings, 'Settings retrieved successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to retrieve settings', 500, error.message));
        }
    }

    async updateSettings(req, res) {
        try {
            const settings = req.body;
            const promises = Object.entries(settings).map(([key, value]) =>
                systemSettingService.updateSetting(key, value, req.user?._id)
            );
            await Promise.all(promises);
            return this.getSettings(req, res);
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to update settings', 400, error.message));
        }
    }

    async rotateApiKey(req, res) {
        try {
            const newKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
            await systemSettingService.updateSetting('master_api_key', newKey, req.user?._id);
            return res.status(200).json(ApiResponse.success({ master_api_key: newKey }, 'API key rotated'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to rotate API key', 500, error.message));
        }
    }

    async getSystemStats(req, res) {
        try {
            const stats = {
                databaseSize: '14.2 MB',
                uptime: '99.98%',
                activeSessions: 18,
                serverStatus: 'Healthy',
                timestamp: new Date().toISOString()
            };
            return res.status(200).json(ApiResponse.success(stats));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to fetch system stats', 500, error.message));
        }
    }
}

module.exports = new SystemSettingController();
