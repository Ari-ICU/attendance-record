'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Bell, Send, Wifi, WifiOff, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '@/api/apiUrl';

export default function NotificationTestPage() {
    const { socket, isConnected, notifications, unreadCount } = useSocket();
    const [testMessage, setTestMessage] = useState('');
    const [testType, setTestType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
    const [testPriority, setTestPriority] = useState<'normal' | 'high'>('normal');
    const [loading, setLoading] = useState(false);
    const [socketStatus, setSocketStatus] = useState<any>(null);

    const sendTestNotification = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${BASE_URL}/notifications/test`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    message: testMessage || 'This is a test notification! 🔔',
                    type: testType,
                    priority: testPriority
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test notification sent!');
                setTestMessage('');
            } else {
                toast.error(data.message || 'Failed to send notification');
            }
        } catch (error) {
            console.error('Error sending test notification:', error);
            toast.error('Failed to send test notification');
        } finally {
            setLoading(false);
        }
    };

    const checkSocketStatus = async () => {
        try {
            const response = await fetch(`${BASE_URL}/notifications/status`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setSocketStatus(data);
            toast.success('Status refreshed');
        } catch (error) {
            console.error('Error checking status:', error);
            toast.error('Failed to check status');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-green-500" size={20} />;
            case 'error': return <AlertCircle className="text-red-500" size={20} />;
            case 'warning': return <AlertTriangle className="text-yellow-500" size={20} />;
            default: return <Info className="text-blue-500" size={20} />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Notification System Test</h1>
                        <p className="text-slate-400">Test and monitor real-time notifications</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${isConnected ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                            {isConnected ? <Wifi size={20} /> : <WifiOff size={20} />}
                            <span className="font-medium">{isConnected ? 'Connected' : 'Disconnected'}</span>
                        </div>
                        <button
                            onClick={checkSocketStatus}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Check Status
                        </button>
                    </div>
                </div>

                {/* Socket Status */}
                {socketStatus && (
                    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Socket Status</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-sm">Connection Status</p>
                                <p className={`text-lg font-bold ${socketStatus.isConnected ? 'text-green-400' : 'text-red-400'}`}>
                                    {socketStatus.isConnected ? 'Connected' : 'Disconnected'}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-sm">Socket ID</p>
                                <p className="text-lg font-bold text-white truncate" title={socketStatus.socketId}>
                                    {socketStatus.socketId || 'N/A'}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-sm">Connected Clients</p>
                                <p className="text-lg font-bold text-white">
                                    {socketStatus.stats?.connectedClients || 0}
                                </p>
                            </div>
                            <div className="bg-slate-800/50 p-4 rounded-lg">
                                <p className="text-slate-400 text-sm">Online Users</p>
                                <p className="text-lg font-bold text-white">
                                    {socketStatus.stats?.onlineUsers || 0}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Notification Form */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <Send size={24} />
                        Send Test Notification
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                            <input
                                type="text"
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                placeholder="Enter notification message..."
                                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
                                <select
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="info">Info</option>
                                    <option value="success">Success</option>
                                    <option value="warning">Warning</option>
                                    <option value="error">Error</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">Priority</label>
                                <select
                                    value={testPriority}
                                    onChange={(e) => setTestPriority(e.target.value as any)}
                                    className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>
                        <button
                            onClick={sendTestNotification}
                            disabled={loading || !isConnected}
                            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send size={20} />
                                    Send Test Notification
                                </>
                            )}
                        </button>
                        {!isConnected && (
                            <p className="text-yellow-500 text-sm text-center">
                                ⚠️ Socket is not connected. Please refresh the page.
                            </p>
                        )}
                    </div>
                </div>

                {/* Notifications List */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                            <Bell size={24} />
                            Recent Notifications
                            {unreadCount > 0 && (
                                <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded-full">
                                    {unreadCount}
                                </span>
                            )}
                        </h2>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border transition-all ${notification.read
                                        ? 'bg-slate-800/30 border-white/5'
                                        : 'bg-blue-500/10 border-blue-500/20'
                                        }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getTypeIcon(notification.type)}
                                        <div className="flex-1">
                                            <p className={`text-sm ${notification.read ? 'text-slate-400' : 'text-white font-medium'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Bell size={48} className="mx-auto text-slate-600 mb-3" />
                                <p className="text-slate-400">No notifications yet</p>
                                <p className="text-slate-500 text-sm mt-1">Send a test notification to see it here</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Debug Info */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Debug Information</h2>
                    <div className="space-y-2 text-sm font-mono">
                        <div className="flex justify-between">
                            <span className="text-slate-400">Socket Instance:</span>
                            <span className="text-white">{socket ? '✓ Available' : '✗ Not Available'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Socket ID:</span>
                            <span className="text-white truncate ml-4">{socket?.id || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Connected:</span>
                            <span className="text-white">{isConnected ? 'Yes' : 'No'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Total Notifications:</span>
                            <span className="text-white">{notifications.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400">Unread Count:</span>
                            <span className="text-white">{unreadCount}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
