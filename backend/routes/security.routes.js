const express = require('express');
const router = express.Router();
const securityController = require('../controllers/security.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

// Apply authentication middleware - only admins can access security routes
router.use(authMiddleware);
router.use(adminOnly);

router.post('/rotate-api-key', securityController.rotateApiKey);
router.get('/export-log', securityController.exportSystemHubLog);
router.get('/stats', securityController.getSystemStats);

module.exports = router;
