const Position = require('../models/position.model');
const { ApiResponse } = require('../utils/apiResponse');

class PositionController {
    static async getAll(req, res) {
        try {
            const positions = await Position.find({ isActive: true }).sort({ title: 1 });
            res.status(200).json(ApiResponse.success(positions, 'Positions retrieved'));
        } catch (error) {
            res.status(500).json(ApiResponse.error('Failed to fetch positions', 500, error.message));
        }
    }

    static async getById(req, res) {
        try {
            const position = await Position.findById(req.params.id);
            if (!position) {
                return res.status(404).json(ApiResponse.error('Position not found', 404));
            }
            res.status(200).json(ApiResponse.success(position));
        } catch (error) {
            res.status(500).json(ApiResponse.error('Failed to fetch position', 500, error.message));
        }
    }

    static async create(req, res) {
        try {
            const position = await Position.create(req.body);
            res.status(201).json(ApiResponse.success(position, 'Position created', 201));
        } catch (error) {
            res.status(400).json(ApiResponse.error(error.message || 'Failed to create position', 400));
        }
    }

    static async update(req, res) {
        try {
            const position = await Position.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!position) {
                return res.status(404).json(ApiResponse.error('Position not found', 404));
            }
            res.status(200).json(ApiResponse.success(position, 'Position updated'));
        } catch (error) {
            res.status(400).json(ApiResponse.error(error.message || 'Failed to update position', 400));
        }
    }

    static async delete(req, res) {
        try {
            const position = await Position.findByIdAndDelete(req.params.id);
            if (!position) {
                return res.status(404).json(ApiResponse.error('Position not found', 404));
            }
            res.status(200).json(ApiResponse.success(null, 'Position deleted'));
        } catch (error) {
            res.status(500).json(ApiResponse.error('Failed to delete position', 500, error.message));
        }
    }
}

module.exports = PositionController;
