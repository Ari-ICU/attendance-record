const { ApiResponse } = require('../utils/apiResponse');
const workScheduleService = require('../services/workSchedule.service');

class WorkScheduleController {
    async createWorkSchedule(req, res) {
        try {
            const workSchedule = await workScheduleService.createWorkSchedule(req.body);
            return res.status(201).json(ApiResponse.success(workSchedule, 'Work schedule created successfully', 201));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to create work schedule', 400, error.message));
        }
    }

    async getWorkSchedule(req, res) {
        try {
            const workSchedule = await workScheduleService.getWorkScheduleById(req.params.id);
            return res.status(200).json(ApiResponse.success(workSchedule, 'Work schedule retrieved successfully', 200));
        } catch (error) {
            return res.status(404).json(ApiResponse.error('Work schedule not found', 404, error.message));
        }
    }

    async getAllWorkSchedules(req, res) {
        try {
            const result = await workScheduleService.getAllWorkSchedules(req.query);
            return res.status(200).json(ApiResponse.success(result, 'Work schedules retrieved successfully', 200));
        } catch (error) {
            return res.status(500).json(ApiResponse.error('Failed to get work schedules', 500, error.message));
        }
    }

    async updateWorkSchedule(req, res) {
        try {
            const workSchedule = await workScheduleService.updateWorkSchedule(req.params.id, req.body);
            return res.status(200).json(ApiResponse.success(workSchedule, 'Work schedule updated successfully', 200));
        } catch (error) {
            return res.status(400).json(ApiResponse.error('Failed to update work schedule', 400, error.message));
        }
    }

    async deleteWorkSchedule(req, res) {
        try {
            const result = await workScheduleService.deleteWorkSchedule(req.params.id);
            return res.status(200).json(ApiResponse.success(result, 'Work schedule deleted successfully', 200));
        } catch (error) {
            return res.status(404).json(ApiResponse.error('Failed to delete work schedule', 404, error.message));
        }
    }
}

module.exports = new WorkScheduleController();
