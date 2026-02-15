const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', adminOnly, EmployeeController.createEmployee);
router.get('/', EmployeeController.getAllEmployees);
router.get('/:id', EmployeeController.getEmployee);
router.put('/:id', adminOnly, EmployeeController.updateEmployee);
router.delete('/:id', adminOnly, EmployeeController.deleteEmployee);
router.post('/verify-face', EmployeeController.verifyFace);

module.exports = router;
