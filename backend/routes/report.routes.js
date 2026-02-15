const express = require('express');
const router = express.Router();
const ReportController = require('../controllers/report.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.get('/analytics', authMiddleware, adminOnly, ReportController.getAnalytics);

module.exports = router;
