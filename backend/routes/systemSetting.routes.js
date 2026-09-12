const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSetting.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/', (req, res) => systemSettingController.getSettings(req, res));
router.post('/', adminOnly, (req, res) => systemSettingController.updateSettings(req, res));
router.put('/', adminOnly, (req, res) => systemSettingController.updateSettings(req, res));
router.post('/rotate-key', adminOnly, (req, res) => systemSettingController.rotateApiKey(req, res));
router.get('/stats', (req, res) => systemSettingController.getSystemStats(req, res));

module.exports = router;
