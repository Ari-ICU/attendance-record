const express = require('express');
const router = express.Router();
const backupController = require('../controllers/backup.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

// Apply authentication middleware - only admins can manage backups
router.use(authMiddleware);
router.use(adminOnly);

router.post('/', backupController.createBackup);
router.get('/', backupController.listBackups);
router.delete('/:filename', backupController.deleteBackup);
router.get('/download/:filename', backupController.downloadBackup);
router.post('/restore/:filename', backupController.restoreBackup);

module.exports = router;
