const express = require('express');
const router = express.Router();
const overtimeController = require('../controllers/overtime.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', overtimeController.createOvertime);
router.get('/', overtimeController.getAllOvertime);
router.patch('/:id/status', adminOnly, overtimeController.updateOvertimeStatus);
router.delete('/:id', adminOnly, overtimeController.deleteOvertime);

module.exports = router;
