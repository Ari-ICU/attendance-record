const Overtime = require('../models/overtime.model');
const Employee = require('../models/employee.model');

exports.createOvertime = async (req, res) => {
    try {
        const { employeeId, hours, date, reason } = req.body;
        const employee = await Employee.findById(employeeId);
        const hourlyRate = employee?.hourlyRate || 0;
        const totalAmount = hourlyRate * (hours || 0);

        const overtime = await Overtime.create({
            employeeId,
            hours,
            date: date || new Date(),
            reason,
            hourlyRate,
            totalAmount,
            approvedBy: req.user?._id
        });

        const populated = await Overtime.findById(overtime._id).populate('employeeId', 'firstName lastName photoUrl position department');
        res.status(201).json({
            success: true,
            data: populated,
            message: 'Overtime record created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create overtime record'
        });
    }
};

exports.getAllOvertime = async (req, res) => {
    try {
        const { status, employeeId, startDate, endDate } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (employeeId) filter.employeeId = employeeId;
        if (startDate || endDate) {
            filter.date = {};
            if (startDate) filter.date.$gte = new Date(startDate);
            if (endDate) filter.date.$lte = new Date(endDate);
        }

        const overtimes = await Overtime.find(filter)
            .populate('employeeId', 'firstName lastName photoUrl position department hourlyRate')
            .populate('approvedBy', 'firstName lastName email')
            .sort({ date: -1 });

        res.status(200).json({
            success: true,
            data: overtimes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch overtime records'
        });
    }
};

exports.updateOvertimeStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const updated = await Overtime.findByIdAndUpdate(
            id,
            {
                status,
                approvedBy: req.user?._id,
                approvedAt: new Date()
            },
            { new: true }
        ).populate('employeeId', 'firstName lastName photoUrl position department');

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Overtime record not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updated,
            message: `Overtime status updated to ${status}`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update overtime status'
        });
    }
};

exports.deleteOvertime = async (req, res) => {
    try {
        const deleted = await Overtime.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Overtime record not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Overtime record deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete overtime record'
        });
    }
};
