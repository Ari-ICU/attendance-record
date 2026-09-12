const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const util = require('util');
const execPromise = util.promisify(exec);

class BackupService {
    constructor() {
        this.backupDir = process.env.BACKUP_DIR || path.join(__dirname, '../backups');
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }
    }

    async createBackup() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const folderName = `backup-${timestamp}`;
        const folderPath = path.join(this.backupDir, folderName);
        const fileName = `${folderName}.tar.gz`;
        const filePath = path.join(this.backupDir, fileName);

        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-record';

        try {
            // 1. Create backup using mongodump
            console.log(`Starting backup to ${folderPath}`);
            await execPromise(`mongodump --uri="${mongoUri}" --out="${folderPath}"`);

            // 2. Compress the backup
            console.log(`Compressing backup to ${filePath}`);
            await execPromise(`tar -czf "${filePath}" -C "${this.backupDir}" "${folderName}"`);

            // 3. Remove the uncompressed folder
            fs.rmSync(folderPath, { recursive: true, force: true });

            const stats = fs.statSync(filePath);
            return {
                filename: fileName,
                size: stats.size,
                createdAt: new Date()
            };
        } catch (error) {
            console.error('Backup failed:', error);
            if (fs.existsSync(folderPath)) {
                fs.rmSync(folderPath, { recursive: true, force: true });
            }
            throw new Error(`Backup failed: ${error.message}`);
        }
    }

    async listBackups() {
        const files = fs.readdirSync(this.backupDir);
        const backups = files
            .filter(file => file.endsWith('.tar.gz'))
            .map(file => {
                const filePath = path.join(this.backupDir, file);
                const stats = fs.statSync(filePath);
                return {
                    filename: file,
                    size: stats.size,
                    createdAt: stats.birthtime
                };
            })
            .sort((a, b) => b.createdAt - a.createdAt);
        return backups;
    }

    async deleteBackup(filename) {
        const filePath = path.join(this.backupDir, filename);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return true;
        }
        throw new Error('Backup file not found');
    }

    async restoreBackup(filename) {
        const filePath = path.join(this.backupDir, filename);
        const extractPath = path.join(this.backupDir, 'restore-tmp');
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/attendance-record';

        if (!fs.existsSync(filePath)) {
            throw new Error('Backup file not found');
        }

        try {
            // 1. Create temp dir
            if (fs.existsSync(extractPath)) {
                fs.rmSync(extractPath, { recursive: true, force: true });
            }
            fs.mkdirSync(extractPath);

            // 2. Extract
            await execPromise(`tar -xzf "${filePath}" -C "${extractPath}"`);

            // 3. Find the backup folder inside (it should be backup-YYYY-MM-DD...)
            const folders = fs.readdirSync(extractPath);
            const backupFolder = folders.find(f => f.startsWith('backup-'));

            if (!backupFolder) {
                throw new Error('Invalid backup file structure');
            }

            const backupDataPath = path.join(extractPath, backupFolder);

            // 4. Restore
            // Note: --drop will drop collections before restoring
            await execPromise(`mongorestore --uri="${mongoUri}" --drop "${backupDataPath}"`);

            // 5. Cleanup
            fs.rmSync(extractPath, { recursive: true, force: true });

            return { success: true, message: 'Restore completed successfully' };
        } catch (error) {
            console.error('Restore failed:', error);
            if (fs.existsSync(extractPath)) {
                fs.rmSync(extractPath, { recursive: true, force: true });
            }
            throw new Error(`Restore failed: ${error.message}`);
        }
    }

    getBackupPath(filename) {
        return path.join(this.backupDir, filename);
    }
}

module.exports = new BackupService();
