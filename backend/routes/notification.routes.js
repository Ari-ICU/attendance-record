const express = require('express');
const router = express.Router();
const { socketUtils } = require('../config/socket.config');
const { authMiddleware } = require('../middlewares/auth.middleware');

/**
 * @route   POST /api/notifications/test
 * @desc    Send a test notification to the current user
 * @access  Private
 */
router.post('/test', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { message, type, priority } = req.body;

        const notification = {
            message: message || 'This is a test notification! 🔔',
            type: type || 'info',
            priority: priority || 'normal',
            timestamp: new Date().toISOString()
        };

        // Try to send via socket
        const sent = socketUtils.sendToUser(userId, 'notification', notification);

        if (sent) {
            res.json({
                success: true,
                message: 'Test notification sent successfully',
                notification
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'User is not connected to socket. Please refresh the page.',
                notification
            });
        }
    } catch (error) {
        console.error('Test notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send test notification',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/notifications/broadcast
 * @desc    Broadcast a notification to all users (Admin only)
 * @access  Private (Admin)
 */
router.post('/broadcast', authMiddleware, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Only admins can broadcast notifications'
            });
        }

        const { message, type, priority } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: 'Message is required'
            });
        }

        const notification = {
            message: message,
            type: type || 'info',
            priority: priority || 'normal',
            timestamp: new Date().toISOString(),
            fromUserId: req.user._id.toString()
        };

        // Broadcast to all users
        socketUtils.broadcast('notification', notification);

        res.json({
            success: true,
            message: 'Notification broadcasted successfully',
            notification
        });
    } catch (error) {
        console.error('Broadcast notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to broadcast notification',
            error: error.message
        });
    }
});

/**
 * @route   POST /api/notifications/send-to-user
 * @desc    Send a notification to a specific user (Admin/HR/Manager only)
 * @access  Private (Admin/HR/Manager)
 */
router.post('/send-to-user', authMiddleware, async (req, res) => {
    try {
        // Check permissions
        if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Insufficient permissions'
            });
        }

        const { targetUserId, message, type, priority } = req.body;

        if (!targetUserId || !message) {
            return res.status(400).json({
                success: false,
                message: 'Target user ID and message are required'
            });
        }

        const notification = {
            message: message,
            type: type || 'info',
            priority: priority || 'normal',
            timestamp: new Date().toISOString(),
            fromUserId: req.user._id.toString()
        };

        // Send to specific user
        const sent = socketUtils.sendToUser(targetUserId, 'notification', notification);

        if (sent) {
            res.json({
                success: true,
                message: 'Notification sent successfully',
                notification
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Target user is not connected',
                notification
            });
        }
    } catch (error) {
        console.error('Send notification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send notification',
            error: error.message
        });
    }
});

/**
 * @route   GET /api/notifications/status
 * @desc    Get socket connection status
 * @access  Private
 */
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const socketId = socketUtils.getUserSocketId(userId);
        const isConnected = !!socketId;

        res.json({
            success: true,
            isConnected,
            socketId: socketId || null,
            userId,
            stats: {
                connectedClients: socketUtils.getConnectedClientsCount(),
                onlineUsers: socketUtils.getOnlineUsersCount()
            }
        });
    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check status',
            error: error.message
        });
    }
});

module.exports = router;
