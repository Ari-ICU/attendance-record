'use client';

import { Activity, Shield, Zap, AlertCircle, CheckCircle2, Radio } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useState } from 'react';

export default function SystemPulse() {
    const { notifications, isConnected } = useSocket();
    const [currentTime, setCurrentTime] = useState<string>('');

    useEffect(() => {
        setCurrentTime(new Date().toLocaleTimeString());
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pulseItems = notifications.slice(0, 8);

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs flex flex-col h-full lg:min-h-[420px] overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="relative flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {isConnected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping absolute inset-0 opacity-75" />}
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">
                            Live Activity Stream
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {isConnected ? 'Real-time WebSocket' : 'Connecting...'} {currentTime && `· ${currentTime}`}
                        </p>
                    </div>
                </div>
                <div className="p-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-500">
                    <Radio size={14} className={isConnected ? 'text-emerald-600' : 'text-slate-400'} />
                </div>
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5 custom-scrollbar">
                {pulseItems.length > 0 ? (
                    pulseItems.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex gap-2.5 items-start transition-colors
                                ${item.type === 'error' ? 'bg-rose-50/70 border-rose-200 text-rose-800' :
                                    item.type === 'success' ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800' :
                                        'bg-slate-50/80 border-slate-200/70 text-slate-700'}`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {item.type === 'error' ? <AlertCircle size={14} className="text-rose-600" /> :
                                    item.type === 'success' ? <CheckCircle2 size={14} className="text-emerald-600" /> :
                                        <Zap size={14} className="text-blue-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        {item.type || 'Event'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-400">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs font-medium leading-relaxed truncate-2">
                                    {item.message}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full min-h-[220px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Activity className="w-8 h-8 text-slate-300" />
                        <p className="text-xs text-slate-400 font-medium">
                            Listening for biometric verification events...
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                    <Shield size={12} className="text-emerald-600" />
                    Encrypted Protocol
                </span>
                <span className="text-[10px] font-mono text-slate-400">Sync: Realtime</span>
            </div>
        </div>
    );
}
