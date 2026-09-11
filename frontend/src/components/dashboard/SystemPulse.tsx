'use client';

import { Activity, Shield, Zap, AlertCircle, CheckCircle2, Radio } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useEffect, useState } from 'react';

export default function SystemPulse() {
    const { notifications, isConnected } = useSocket();
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const pulseItems = notifications.slice(0, 8);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full lg:h-[400px] overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                            Live Activity Stream
                        </h2>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                            {isConnected ? 'Real-time sync active' : 'Offline'} · {currentTime}
                        </p>
                    </div>
                </div>
                <div className="p-1.5 bg-slate-800 rounded-lg text-slate-400">
                    <Radio size={14} className={isConnected ? 'text-emerald-400' : 'text-slate-500'} />
                </div>
            </div>

            {/* Notifications Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {pulseItems.length > 0 ? (
                    pulseItems.map((item) => (
                        <div
                            key={item.id}
                            className={`p-3 rounded-xl border flex gap-3 items-start transition-colors
                                ${item.type === 'error' ? 'bg-rose-950/20 border-rose-800/40 text-rose-300' :
                                    item.type === 'success' ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' :
                                        'bg-slate-950 border-slate-800 text-slate-300'}`}
                        >
                            <div className="shrink-0 mt-0.5">
                                {item.type === 'error' ? <AlertCircle size={14} className="text-rose-400" /> :
                                    item.type === 'success' ? <CheckCircle2 size={14} className="text-emerald-400" /> :
                                        <Zap size={14} className="text-blue-400" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        {item.type || 'Event'}
                                    </span>
                                    <span className="text-[10px] font-mono text-slate-500">
                                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-200 line-clamp-2 leading-relaxed">
                                    {item.message}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                        <Activity className="w-8 h-8 text-slate-700" />
                        <p className="text-xs text-slate-400">
                            Waiting for real-time events...
                        </p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-950/60 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <Shield size={12} className="text-emerald-500" />
                        Encrypted Stream
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">Auto-refresh: ON</span>
                </div>
            </div>
        </div>
    );
}
