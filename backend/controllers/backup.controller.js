const backupService = require('../services/backup.service');
const { ApiResponse } = require('../utils/apiResponse');
const path = require('path');
const fs = require('fs');

class BackupController {
    async createBackup(req, res) {
        try {
            const backup = await backupService.createBackup();
            return res.status(201).json(ApiResponse.success(backup, 'Backup created successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to create backup', 500, error.message));
        }
    }

    async listBackups(req, res) {
        try {
            const backups = await backupService.listBackups();
            return res.status(200).json(ApiResponse.success(backups, 'Backups retrieved successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to list backups', 500, error.message));
        }
    }

    async deleteBackup(req, res) {
        try {
            const { filename } = req.params;
            await backupService.deleteBackup(filename);
            return res.status(200).json(ApiResponse.success(null, 'Backup deleted successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to delete backup', 500, error.message));
        }
    }

    async downloadBackup(req, res) {
        try {
            const { filename } = req.params;
            const filePath = backupService.getBackupPath(filename);

            if (!fs.existsSync(filePath)) {
                return res.status(404).json(ApiResponse.error('Backup file not found', 404));
            }

            res.download(filePath, filename);
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to download backup', 500, error.message));
        }
    }

    async restoreBackup(req, res) {
        try {
            const { filename } = req.params;
            const result = await backupService.restoreBackup(filename);
            return res.status(200).json(ApiResponse.success(result, 'Restore completed successfully'));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to restore backup', 500, error.message));
        }
    }
}

module.exports = new BackupController();
