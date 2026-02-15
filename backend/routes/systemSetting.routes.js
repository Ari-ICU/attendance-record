const express = require('express');
const router = express.Router();
const systemSettingController = require('../controllers/systemSetting.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Apply authentication middleware
router.use(authMiddleware);

// Only admins can manage settings
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};

router.get('/', systemSettingController.getSettings);
router.post('/', adminOnly, systemSettingController.updateSettings);

module.exports = router;
