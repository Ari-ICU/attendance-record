const { Server } = require('socket.io');

// Environment configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Socket.IO configuration
const socketConfig = {
    // CORS configuration
    cors: {
        origin: isDevelopment
            ? ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
            : process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [],
        methods: ["GET", "POST"],
        credentials: true
    },

    // Connection settings
    connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
        skipMiddlewares: true
    },

    // Transport settings
    transports: ['websocket', 'polling'],

    // Ping settings
    pingTimeout: 60000, // 60 seconds
    pingInterval: 25000, // 25 seconds

    // Max HTTP buffer size
    maxHttpBufferSize: 1e6, // 1MB

    // Allow EIO3 (for older clients)
    allowEIO3: true,

    // Serve client
    serveClient: false, // We'll serve from frontend

    // Path
    path: '/socket.io/',

    // Namespace settings
    namespace: {
        attendance: '/attendance',
        admin: '/admin',
        notifications: '/notifications'
    }
};

// Socket.IO server instance
let io = null;
let isInitialized = false;

// Connected clients tracking
const connectedClients = new Map();
const userSockets = new Map(); // userId -> socketId mapping
const roomMembers = new Map(); // roomId -> Set of socketIds

// Event handlers
const eventHandlers = {
    // Connection events
    connection: (socket) => {
        console.log(`🔌 Client connected: ${socket.id}`);
        connectedClients.set(socket.id, {
            id: socket.id,
            userId: null,
            userRole: null,
            department: null,
            connectedAt: new Date(),
            lastActivity: new Date()
        });

        // Send connection confirmation
        socket.emit('connected', {
            success: true,
            message: 'Connected to attendance system',
            socketId: socket.id,
            timestamp: new Date().toISOString()
        });
    },

    disconnect: (socket) => {
        console.log(`🔌 Client disconnected: ${socket.id}`);
        const client = connectedClients.get(socket.id);

        if (client && client.userId) {
            userSockets.delete(client.userId);

            // Remove from all rooms
            for (const [roomId, members] of roomMembers.entries()) {
                if (members.has(socket.id)) {
                    members.delete(socket.id);
                    if (members.size === 0) {
                        roomMembers.delete(roomId);
                    }
                }
            }

            // Notify other clients about user going offline
            socket.broadcast.emit('user_offline', {
                userId: client.userId,
                timestamp: new Date().toISOString()
            });
        }

        connectedClients.delete(socket.id);
    },

    // Authentication events
    authenticate: (socket, data) => {
        try {
            const { userId, userRole, department, token } = data;

            // Validate authentication data
            if (!userId || !userRole) {
                socket.emit('auth_error', {
                    success: false,
                    message: 'Invalid authentication data'
                });
                return;
            }

            // Update client information
            const client = connectedClients.get(socket.id);
            if (client) {
                client.userId = userId;
                client.userRole = userRole;
                client.department = department;
                client.lastActivity = new Date();

                // Map user to socket
                userSockets.set(userId, socket.id);

                // Join user-specific room
                socket.join(`user:${userId}`);

                // Join department room
                if (department) {
                    socket.join(`department:${department}`);
                }

                // Join role-based room
                socket.join(`role:${userRole}`);

                // Notify successful authentication
                socket.emit('authenticated', {
                    success: true,
                    message: 'Authentication successful',
                    userId: userId,
                    userRole: userRole,
                    department: department,
                    timestamp: new Date().toISOString()
                });

                // Notify other clients about user coming online
                socket.broadcast.emit('user_online', {
                    userId: userId,
                    userRole: userRole,
                    department: department,
                    timestamp: new Date().toISOString()
                });

                console.log(`✅ User authenticated: ${userId} (${userRole})`);
            }
        } catch (error) {
            console.error('Authentication error:', error);
            socket.emit('auth_error', {
                success: false,
                message: 'Authentication failed'
            });
        }
    },

    // Attendance events
    check_in: (socket, data) => {
        try {
            const { userId, location, timestamp, notes } = data;
            const client = connectedClients.get(socket.id);

            if (!client || !client.userId) {
                socket.emit('check_in_error', {
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Process check-in
            const checkInData = {
                userId: client.userId,
                location: location,
                timestamp: timestamp || new Date().toISOString(),
                notes: notes,
                socketId: socket.id
            };

            // Emit to user's department
            socket.to(`department:${client.department}`).emit('user_checked_in', checkInData);

            // Emit to admin users
            socket.to('role:admin').emit('attendance_update', {
                type: 'check_in',
                ...checkInData
            });

            // Confirm check-in
            socket.emit('check_in_success', {
                success: true,
                message: 'Check-in successful',
                data: checkInData
            });

            console.log(`✅ Check-in: ${client.userId} at ${location}`);
        } catch (error) {
            console.error('Check-in error:', error);
            socket.emit('check_in_error', {
                success: false,
                message: 'Check-in failed'
            });
        }
    },

    check_out: (socket, data) => {
        try {
            const { userId, location, timestamp, notes } = data;
            const client = connectedClients.get(socket.id);

            if (!client || !client.userId) {
                socket.emit('check_out_error', {
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            // Process check-out
            const checkOutData = {
                userId: client.userId,
                location: location,
                timestamp: timestamp || new Date().toISOString(),
                notes: notes,
                socketId: socket.id
            };

            // Emit to user's department
            socket.to(`department:${client.department}`).emit('user_checked_out', checkOutData);

            // Emit to admin users
            socket.to('role:admin').emit('attendance_update', {
                type: 'check_out',
                ...checkOutData
            });

            // Confirm check-out
            socket.emit('check_out_success', {
                success: true,
                message: 'Check-out successful',
                data: checkOutData
            });

            console.log(`✅ Check-out: ${client.userId} at ${location}`);
        } catch (error) {
            console.error('Check-out error:', error);
            socket.emit('check_out_error', {
                success: false,
                message: 'Check-out failed'
            });
        }
    },

    // Location tracking
    location_update: (socket, data) => {
        try {
            const { latitude, longitude, accuracy } = data;
            const client = connectedClients.get(socket.id);

            if (!client || !client.userId) {
                return; // Silently ignore for unauthenticated users
            }

            const locationData = {
                userId: client.userId,
                latitude: latitude,
                longitude: longitude,
                accuracy: accuracy,
                timestamp: new Date().toISOString()
            };

            // Update client location
            client.lastLocation = locationData;

            // Emit to admin users for tracking
            socket.to('role:admin').emit('location_update', locationData);

        } catch (error) {
            console.error('Location update error:', error);
        }
    },

    // Notification events
    send_notification: (socket, data) => {
        try {
            const { targetUserId, message, type, priority } = data;
            const client = connectedClients.get(socket.id);

            if (!client || !['admin', 'hr', 'manager'].includes(client.userRole)) {
                socket.emit('notification_error', {
                    success: false,
                    message: 'Insufficient permissions'
                });
                return;
            }

            const notification = {
                fromUserId: client.userId,
                targetUserId: targetUserId,
                message: message,
                type: type || 'info',
                priority: priority || 'normal',
                timestamp: new Date().toISOString()
            };

            // Send to specific user
            if (targetUserId) {
                const targetSocketId = userSockets.get(targetUserId);
                if (targetSocketId) {
                    io.to(targetSocketId).emit('notification', notification);
                }
            } else {
                // Broadcast to all users
                io.emit('notification', notification);
            }

            socket.emit('notification_sent', {
                success: true,
                message: 'Notification sent successfully'
            });

        } catch (error) {
            console.error('Notification error:', error);
            socket.emit('notification_error', {
                success: false,
                message: 'Failed to send notification'
            });
        }
    },

    // Room management
    join_room: (socket, data) => {
        try {
            const { roomId } = data;
            const client = connectedClients.get(socket.id);

            if (!client || !client.userId) {
                socket.emit('room_error', {
                    success: false,
                    message: 'User not authenticated'
                });
                return;
            }

            socket.join(roomId);

            // Track room membership
            if (!roomMembers.has(roomId)) {
                roomMembers.set(roomId, new Set());
            }
            roomMembers.get(roomId).add(socket.id);

            socket.emit('room_joined', {
                success: true,
                roomId: roomId,
                message: `Joined room: ${roomId}`
            });

            // Notify room members
            socket.to(roomId).emit('user_joined_room', {
                userId: client.userId,
                roomId: roomId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Join room error:', error);
            socket.emit('room_error', {
                success: false,
                message: 'Failed to join room'
            });
        }
    },

    leave_room: (socket, data) => {
        try {
            const { roomId } = data;
            const client = connectedClients.get(socket.id);

            socket.leave(roomId);

            // Update room membership
            if (roomMembers.has(roomId)) {
                roomMembers.get(roomId).delete(socket.id);
                if (roomMembers.get(roomId).size === 0) {
                    roomMembers.delete(roomId);
                }
            }

            socket.emit('room_left', {
                success: true,
                roomId: roomId,
                message: `Left room: ${roomId}`
            });

            // Notify room members
            socket.to(roomId).emit('user_left_room', {
                userId: client?.userId,
                roomId: roomId,
                timestamp: new Date().toISOString()
            });

        } catch (error) {
            console.error('Leave room error:', error);
            socket.emit('room_error', {
                success: false,
                message: 'Failed to leave room'
            });
        }
    },

    // Heartbeat/ping
    ping: (socket) => {
        const client = connectedClients.get(socket.id);
        if (client) {
            client.lastActivity = new Date();
        }
        socket.emit('pong', {
            timestamp: new Date().toISOString()
        });
    }
};

// Initialize Socket.IO server
const initializeSocketIO = (httpServer) => {
    try {
        io = new Server(httpServer, socketConfig);
        isInitialized = true;

        // Set up event handlers
        io.on('connection', (socket) => {
            // Connection event
            eventHandlers.connection(socket);

            // Set up all event listeners
            socket.on('authenticate', (data) => eventHandlers.authenticate(socket, data));
            socket.on('check_in', (data) => eventHandlers.check_in(socket, data));
            socket.on('check_out', (data) => eventHandlers.check_out(socket, data));
            socket.on('location_update', (data) => eventHandlers.location_update(socket, data));
            socket.on('send_notification', (data) => eventHandlers.send_notification(socket, data));
            socket.on('join_room', (data) => eventHandlers.join_room(socket, data));
            socket.on('leave_room', (data) => eventHandlers.leave_room(socket, data));
            socket.on('ping', () => eventHandlers.ping(socket));

            // Disconnect event
            socket.on('disconnect', () => eventHandlers.disconnect(socket));
        });

        console.log('✅ Socket.IO server initialized successfully');
        return io;

    } catch (error) {
        console.error('❌ Failed to initialize Socket.IO:', error.message);
        throw error;
    }
};

// Utility functions
const socketUtils = {
    // Get connected clients count
    getConnectedClientsCount: () => connectedClients.size,

    // Get online users count
    getOnlineUsersCount: () => userSockets.size,

    // Get client information
    getClientInfo: (socketId) => connectedClients.get(socketId),

    // Get user socket ID
    getUserSocketId: (userId) => userSockets.get(userId),

    // Send message to user
    sendToUser: (userId, event, data) => {
        const socketId = userSockets.get(userId);
        if (socketId && io) {
            io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    },

    // Send message to department
    sendToDepartment: (department, event, data) => {
        if (io) {
            io.to(`department:${department}`).emit(event, data);
            return true;
        }
        return false;
    },

    // Send message to role
    sendToRole: (role, event, data) => {
        if (io) {
            io.to(`role:${role}`).emit(event, data);
            return true;
        }
        return false;
    },

    // Broadcast to all connected clients
    broadcast: (event, data) => {
        if (io) {
            io.emit(event, data);
            return true;
        }
        return false;
    },

    // Get room members count
    getRoomMembersCount: (roomId) => {
        return roomMembers.has(roomId) ? roomMembers.get(roomId).size : 0;
    },

    // Get all connected users
    getConnectedUsers: () => {
        const users = [];
        for (const [socketId, client] of connectedClients.entries()) {
            if (client.userId) {
                users.push({
                    userId: client.userId,
                    userRole: client.userRole,
                    department: client.department,
                    connectedAt: client.connectedAt,
                    lastActivity: client.lastActivity,
                    socketId: socketId
                });
            }
        }
        return users;
    }
};

// Health check function
const checkSocketIOHealth = () => {
    return {
        isInitialized: isInitialized,
        connectedClients: connectedClients.size,
        onlineUsers: userSockets.size,
        activeRooms: roomMembers.size,
        config: {
            cors: socketConfig.cors,
            transports: socketConfig.transports,
            pingTimeout: socketConfig.pingTimeout,
            pingInterval: socketConfig.pingInterval
        }
    };
};

// Export configuration and functions
module.exports = {
    // Configuration
    socketConfig,

    // Initialization
    initializeSocketIO,

    // Health and status
    checkSocketIOHealth,
    isInitialized: () => isInitialized,

    // Utility functions
    socketUtils,

    // Server instance
    getIO: () => io,

    // Event handlers (for testing)
    eventHandlers
};
