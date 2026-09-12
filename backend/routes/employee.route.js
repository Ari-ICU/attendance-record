const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

// Public routes (for face recognition kiosk)
router.get('/', EmployeeController.getAllEmployees);
router.post('/verify-face', EmployeeController.verifyFace);

// Protected routes (admin only)
router.use(authMiddleware);
router.post('/', adminOnly, EmployeeController.createEmployee);
router.get('/:id', EmployeeController.getEmployee);
router.put('/:id', adminOnly, EmployeeController.updateEmployee);
router.delete('/:id', adminOnly, EmployeeController.deleteEmployee);

module.exports = router;
