const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { authMiddleware, optionalAuth, adminOnly } = require('../middlewares/auth.middleware');

// Public/Kiosk routes (supports optional auth if logged in)
router.get('/', optionalAuth, EmployeeController.getAllEmployees);
router.post('/verify-face', EmployeeController.verifyFace);

// Protected routes
router.use(authMiddleware);
router.post('/', adminOnly, EmployeeController.createEmployee);
router.get('/:id', EmployeeController.getEmployee);
router.put('/:id', adminOnly, EmployeeController.updateEmployee);
router.delete('/:id', adminOnly, EmployeeController.deleteEmployee);

module.exports = router;
