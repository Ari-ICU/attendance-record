const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', adminOnly, departmentController.createDepartment);
router.get('/', departmentController.getAllDepartments);
router.get('/:id', departmentController.getDepartmentById);
router.put('/:id', adminOnly, departmentController.updateDepartment);
router.delete('/:id', adminOnly, departmentController.deleteDepartment);

module.exports = router;
