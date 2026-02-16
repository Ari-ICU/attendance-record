'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { BASE_URL } from '@/api/apiUrl';
import { toast } from 'react-hot-toast';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    notifications: Notification[];
    unreadCount: number;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    clearNotifications: () => void;
}

export interface Notification {
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: string;
    read: boolean;
    from?: string;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    // Initial connection
    useEffect(() => {
        // If not authenticated, ensure we clean up state
        if (!user || !token) {
            setSocket(null);
            setIsConnected(false);
            return;
        }

        // Connect to the backend socket
        // Adjust URL based on your specific backend setup. If BASE_URL includes /api, strip it.
        const socketUrl = BASE_URL.replace(/\/api\/?$/, '');

        const newSocket = io(socketUrl, {
            path: '/socket.io/',
            transports: ['websocket', 'polling'],
            auth: {
                token: token
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        // Connection handlers
        newSocket.on('connect', () => {
            console.log('Socket connected:', newSocket.id);
            setIsConnected(true);

            // Authenticate immediately upon connection
            newSocket.emit('authenticate', {
                userId: user._id,
                userRole: user.role,
                department: user.department,
                token: token
            });
        });

        newSocket.on('disconnect', () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setIsConnected(false);
        });

        // Authentication response
        newSocket.on('authenticated', (data) => {
            if (data.success) {
                console.log('Socket authenticated successfully');
            } else {
                console.error('Socket authentication failed:', data.message);
            }
        });

        // Listen for notifications
        newSocket.on('notification', (data) => {
            const newNotification: Notification = {
                id: Date.now().toString(), // Simple ID generation
                type: data.type || 'info',
                message: data.message,
                timestamp: data.timestamp || new Date().toISOString(),
                read: false,
                from: data.fromUserId
            };

            setNotifications(prev => [newNotification, ...prev]);
            setUnreadCount(prev => prev + 1);

            // Show toast for high priority or important notifications
            if (data.priority === 'high' || data.type === 'error') {
                toast.error(data.message, { duration: 5000 });
            } else if (data.type === 'success') {
                toast.success(data.message);
            } else {
                toast(data.message, { icon: '🔔' });
            }
        });

        // Listen for attendance updates (for admins)
        if (user.role === 'admin') {
            newSocket.on('attendance_update', (data) => {
                const message = `${data.userId} just ${data.type === 'check_in' ? 'checked in' : 'checked out'}`;
                const newNotification: Notification = {
                    id: Date.now().toString(),
                    type: 'info',
                    message,
                    timestamp: new Date().toISOString(),
                    read: false
                };
                setNotifications(prev => [newNotification, ...prev]);
                setUnreadCount(prev => prev + 1);
                toast(message, { icon: '🕒' });
            });
        }

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [user, token]);

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const clearNotifications = () => {
        setNotifications([]);
        setUnreadCount(0);
    };

    return (
        <SocketContext.Provider value={{
            socket,
            isConnected,
            notifications,
            unreadCount,
            markAsRead,
            markAllAsRead,
            clearNotifications
        }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};
