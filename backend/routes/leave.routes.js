const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leave.controller');
const { authMiddleware, adminOnly } = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.post('/', leaveController.createLeave);
router.get('/', leaveController.getAllLeaves);
router.patch('/:id/status', adminOnly, leaveController.updateLeaveStatus);
router.delete('/:id', adminOnly, leaveController.deleteLeave);

module.exports = router;
