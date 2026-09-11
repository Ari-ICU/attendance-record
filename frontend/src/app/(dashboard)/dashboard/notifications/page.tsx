'use client';

import { useState } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Bell, Send, Wifi, WifiOff, CheckCircle, AlertCircle, Info, AlertTriangle, RefreshCw } from 'lucide-react';
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
                    message: testMessage || 'This is a test notification 🔔',
                    type: testType,
                    priority: testPriority
                })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Test notification sent');
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
            case 'success': return <CheckCircle className="text-emerald-400 shrink-0" size={18} />;
            case 'error': return <AlertCircle className="text-rose-400 shrink-0" size={18} />;
            case 'warning': return <AlertTriangle className="text-amber-400 shrink-0" size={18} />;
            default: return <Info className="text-blue-400 shrink-0" size={18} />;
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Notification Station</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Monitor real-time WebSocket connections and dispatch test notifications.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                        isConnected
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    }`}>
                        {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
                        <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                    <button
                        onClick={checkSocketStatus}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
                    >
                        <RefreshCw size={13} />
                        <span>Check Status</span>
                    </button>
                </div>
            </div>

            {/* Socket Status Details (if refreshed) */}
            {socketStatus && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <h2 className="text-sm font-bold text-white uppercase tracking-wider">Socket Telemetry</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-medium">Link Status</p>
                            <p className={`text-base font-bold mt-1 ${socketStatus.isConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {socketStatus.isConnected ? 'Connected' : 'Disconnected'}
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-medium">Socket ID</p>
                            <p className="text-xs font-mono font-bold text-white truncate mt-1" title={socketStatus.socketId}>
                                {socketStatus.socketId || 'N/A'}
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-medium">Connected Clients</p>
                            <p className="text-base font-bold text-white mt-1">
                                {socketStatus.stats?.connectedClients || 0}
                            </p>
                        </div>
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                            <p className="text-slate-400 text-xs font-medium">Online Users</p>
                            <p className="text-base font-bold text-white mt-1">
                                {socketStatus.stats?.onlineUsers || 0}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Notification Form */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                            <Send size={16} />
                        </div>
                        <h2 className="text-base font-bold text-white">Send Broadcast Notification</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-300">Message Content</label>
                            <input
                                type="text"
                                value={testMessage}
                                onChange={(e) => setTestMessage(e.target.value)}
                                placeholder="Enter notification message payload..."
                                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Notice Type</label>
                                <select
                                    value={testType}
                                    onChange={(e) => setTestType(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors capitalize"
                                >
                                    <option value="info">Info (Blue)</option>
                                    <option value="success">Success (Green)</option>
                                    <option value="warning">Warning (Amber)</option>
                                    <option value="error">Error (Rose)</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-300">Priority Level</label>
                                <select
                                    value={testPriority}
                                    onChange={(e) => setTestPriority(e.target.value as any)}
                                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 transition-colors capitalize"
                                >
                                    <option value="normal">Normal</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={sendTestNotification}
                            disabled={loading || !isConnected}
                            className="w-full px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Transmitting...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={15} />
                                    <span>Send Notification</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Notifications Log */}
                <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Bell size={16} />
                            </div>
                            <h2 className="text-base font-bold text-white">Live Stream Log</h2>
                        </div>
                        {unreadCount > 0 && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {notifications.length > 0 ? (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-3.5 rounded-xl border transition-all ${
                                        notification.read
                                            ? 'bg-slate-950 border-slate-800'
                                            : 'bg-blue-500/5 border-blue-500/20'
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        {getTypeIcon(notification.type)}
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs sm:text-sm font-medium leading-relaxed ${notification.read ? 'text-slate-300' : 'text-white'}`}>
                                                {notification.message}
                                            </p>
                                            <p className="text-[11px] text-slate-500 font-mono mt-1">
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Bell size={36} className="mx-auto text-slate-700 mb-2" />
                                <p className="text-slate-400 text-xs font-medium">No live notifications received</p>
                                <p className="text-slate-500 text-[11px] mt-0.5">Send a test notification above to preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
