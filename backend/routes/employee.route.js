const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/employee.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/', EmployeeController.createEmployee);
router.get('/', EmployeeController.getAllEmployees);
router.get('/:id', EmployeeController.getEmployee);
router.put('/:id', EmployeeController.updateEmployee);
router.delete('/:id', EmployeeController.deleteEmployee);
router.post('/verify-face', EmployeeController.verifyFace);

module.exports = router;
