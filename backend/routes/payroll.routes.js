const express = require('express');
const router = express.Router();
const PayrollController = require('../controllers/payroll.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

// Stats & Ledger
router.get('/stats', PayrollController.getStats);
router.get('/ledger', PayrollController.getLedger);
router.get('/monthly', PayrollController.getMonthly);
router.get('/payslips/:id', PayrollController.getPayslipById);
router.get('/employee/:employeeId', PayrollController.getEmployeePayslips);

// Actions
router.put('/payslips/:id/status', adminOnly, PayrollController.updatePayslipStatus);
router.post('/mark-all-paid', adminOnly, PayrollController.markAllAsPaid);
router.post('/disburse', adminOnly, PayrollController.disburse);
router.post('/approve', adminOnly, PayrollController.approve);
router.post('/top-up', adminOnly, PayrollController.topUp);
router.put('/company-bank', adminOnly, PayrollController.updateBankDetails);
router.post('/generate', adminOnly, PayrollController.generate);

module.exports = router;
