const express = require('express');
const router = express.Router();
const workScheduleController = require('../controllers/workSchedule.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Create a new work schedule
router.post('/', workScheduleController.createWorkSchedule);

// Get all work schedules
router.get('/', workScheduleController.getAllWorkSchedules);

// Get a single work schedule by ID
router.get('/:id', workScheduleController.getWorkSchedule);

// Update a work schedule
router.put('/:id', workScheduleController.updateWorkSchedule);

// Delete a work schedule
router.delete('/:id', workScheduleController.deleteWorkSchedule);

module.exports = router;
