const Leave = require('../models/leave.model');
const Employee = require('../models/employee.model');

exports.createLeave = async (req, res) => {
    try {
        let employeeId = req.body.employeeId;

        // If regular employee/student, enforce that they only submit for themselves
        if (req.user && !['admin', 'manager', 'superadmin'].includes(req.user.role)) {
            const selfEmp = await Employee.findOne({ email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } });
            if (!selfEmp) {
                return res.status(403).json({ success: false, message: 'No linked employee profile found for your account' });
            }
            employeeId = selfEmp._id;
        }

        const leave = await Leave.create({
            ...req.body,
            employeeId,
            approvedBy: req.user?.role === 'admin' ? req.user?._id : undefined
        });
        const populated = await Leave.findById(leave._id).populate('employeeId', 'firstName lastName photoUrl position department');
        res.status(201).json({
            success: true,
            data: populated,
            message: 'Leave request created successfully'
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create leave request'
        });
    }
};

exports.getAllLeaves = async (req, res) => {
    try {
        const { status, employeeId, leaveType } = req.query;
        const filter = {};
        if (status) filter.status = status;
        if (leaveType) filter.leaveType = leaveType;

        // If regular employee, only allow viewing their own leaves
        if (req.user && !['admin', 'manager', 'superadmin'].includes(req.user.role)) {
            const selfEmp = await Employee.findOne({ email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } });
            if (selfEmp) {
                filter.employeeId = selfEmp._id;
            } else {
                return res.status(200).json({ success: true, data: [] });
            }
        } else if (employeeId) {
            filter.employeeId = employeeId;
        }

        const leaves = await Leave.find(filter)
            .populate('employeeId', 'firstName lastName photoUrl position department')
            .populate('approvedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: leaves
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch leave requests'
        });
    }
};

exports.updateLeaveStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const updateData = {
            status,
            approvedBy: req.user?._id,
            approvedAt: new Date()
        };
        if (rejectionReason) updateData.rejectionReason = rejectionReason;

        const updated = await Leave.findByIdAndUpdate(id, updateData, { new: true })
            .populate('employeeId', 'firstName lastName photoUrl position department')
            .populate('approvedBy', 'firstName lastName email');

        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }

        res.status(200).json({
            success: true,
            data: updated,
            message: `Leave request ${status} successfully`
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to update leave status'
        });
    }
};

exports.deleteLeave = async (req, res) => {
    try {
        const deleted = await Leave.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: 'Leave request not found'
            });
        }
        res.status(200).json({
            success: true,
            message: 'Leave request deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete leave request'
        });
    }
};
