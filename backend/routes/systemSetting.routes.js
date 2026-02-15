const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSetting.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

// Apply authentication middleware
router.use(authMiddleware);

router.get('/', systemSettingController.getSettings);
router.post('/', adminOnly, systemSettingController.updateSettings);

module.exports = router;
