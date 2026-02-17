const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payroll.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', PayrollController.getStats);
router.get('/ledger', PayrollController.getLedger);
router.post('/disburse', PayrollController.disburse);
router.post('/approve', PayrollController.approve);
router.post('/generate', PayrollController.generate);

module.exports = router;
