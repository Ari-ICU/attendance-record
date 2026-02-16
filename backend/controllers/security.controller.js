const systemSettingService = require('../services/systemSetting.service');
const User = require('../models/user.model');
const Attendance = require('../models/attendance.model');
const BackupService = require('../services/backup.service');
const { ApiResponse } = require('../utils/apiResponse');
const crypto = require('crypto');
const mongoose = require('mongoose');
const os = require('os');

class SecurityController {
    async rotateApiKey(req, res) {
        try {
            const newKey = `sk_live_${crypto.randomBytes(16).toString('hex')}`;
            await systemSettingService.updateSetting('master_api_key', newKey, req.user._id);

            return res.status(200).json(ApiResponse.success({ master_api_key: newKey }, 'Security seed rotated successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to rotate security seed', 500, error.message));
        }
    }

    async getSystemStats(req, res) {
        try {
            // Database Stats
            const dbStats = await mongoose.connection.db.stats();
            const storageSize = (dbStats.dataSize / 1024 / 1024).toFixed(2); // MB

            // Server Stats
            const memoryUsage = process.memoryUsage();
            const usedMemory = (memoryUsage.rss / 1024 / 1024).toFixed(2); // MB

            // Connection Count (Approximate using Mongo connections as proxy for activity level)
            const connections = (await mongoose.connection.db.admin().serverStatus()).connections;

            const stats = {
                storage: `${storageSize} MB`,
                storage_status: dbStats.dataSize > 1024 * 1024 * 1024 ? 'Warning' : 'Optimal',
                active_nodes: connections.current || 1,
                node_status: 'Cluster',
                memory: `${usedMemory} MB`,
                mongo_version: dbStats.version,
                uptime: process.uptime()
            };

            return res.status(200).json(ApiResponse.success(stats, 'System stats retrieved'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to retrieve system stats', 500, error.message));
        }
    }

    async exportSystemHubLog(req, res) {
        try {
            const users = await User.find().select('-password').limit(20).sort({ createdAt: -1 }).lean();
            const attendance = await Attendance.find().limit(50).sort({ date: -1 }).lean();
            const backups = await BackupService.listBackups();
            const settings = await systemSettingService.getAllSettings();

            const systemLog = {
                exported_at: new Date().toISOString(),
                exported_by: req.user.username,
                system_status: 'operational',
                node_env: process.env.NODE_ENV,
                active_nodes: 1, // Single instance
                recent_users: users.map(u => ({ id: u._id, username: u.username, role: u.role, created: u.createdAt })),
                recent_activity: attendance.map(a => ({ user: a.user, date: a.date, status: a.status, checkIn: a.checkInTime, checkOut: a.checkOutTime })),
                backup_ledger: backups.slice(0, 5),
                configuration_snapshot: {
                    organization: settings.organization_name,
                    domain: settings.domain,
                    security_policy: {
                        grace_period: settings.grace_period_minutes,
                        geofence_radius: settings.geofence_range_meters
                    }
                }
            };

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=system-log-${Date.now()}.json`);
            return res.send(JSON.stringify(systemLog, null, 2));

        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to export system log', 500, error.message));
        }
    }
}

module.exports = new SecurityController();
