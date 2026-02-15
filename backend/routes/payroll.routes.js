const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payroll.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }
    next();
};

router.use(authMiddleware);
router.use(adminOnly);

router.get('/stats', PayrollController.getStats);
router.get('/ledger', PayrollController.getLedger);
router.post('/disburse', PayrollController.disburse);
router.post('/generate', PayrollController.generate);

module.exports = router;
