const SystemSetting = require('../models/systemSetting.model');

class SystemSettingService {
    async getSetting(key) {
        const setting = await SystemSetting.findOne({ key });
        return setting ? setting.value : null;
    }

    async updateSetting(key, value, userId) {
        let setting = await SystemSetting.findOne({ key });
        if (setting) {
            setting.value = value;
            setting.updatedBy = userId;
            await setting.save();
        } else {
            setting = await SystemSetting.create({ key, value, updatedBy: userId });
        }
        return setting;
    }

    async getAllSettings() {
        const settings = await SystemSetting.find();
        return settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
    }

    async initializeDefaults() {
        const defaults = [
            { key: 'work_start_time', value: '08:00', description: 'Default check-in time' },
            { key: 'work_end_time', value: '17:00', description: 'Default check-out time' },
            { key: 'grace_period_minutes', value: 15, description: 'Minutes allowed after start time before being marked late' },
            { key: 'office_latitude', value: 11.5564, description: 'Office center latitude' },
            { key: 'office_longitude', value: 104.9282, description: 'Office center longitude' },
            { key: 'geofence_range_meters', value: 50, description: 'Authorized scanning radius in meters' }
        ];

        for (const def of defaults) {
            const exists = await SystemSetting.findOne({ key: def.key });
            if (!exists) {
                await SystemSetting.create(def);
            }
        }
    }
}

module.exports = new SystemSettingService();
