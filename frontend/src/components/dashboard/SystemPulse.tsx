'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Shield, Zap, Terminal, AlertCircle, CheckCircle2 } from 'lucide-react';
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

    const pulseItems = notifications.slice(0, 8); // Show only top 8

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-pane rounded-[2rem] border border-white/10 overflow-hidden flex flex-col h-full lg:h-[400px]"
        >
            <div className="p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
                        <div className={`absolute inset-0 w-3 h-3 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-rose-500'} animate-ping opacity-50`} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                            System Hub Pulse
                            <Terminal size={14} className="text-blue-400" />
                        </h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {isConnected ? 'Neural Connection Active' : 'Offline Mode'} • {currentTime}
                        </p>
                    </div>
                </div>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/20" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/40" />
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500/60" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                <AnimatePresence mode="popLayout">
                    {pulseItems.length > 0 ? (
                        pulseItems.map((item, i) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                transition={{ duration: 0.4, delay: i * 0.05 }}
                                className={`p-4 rounded-2xl border flex gap-4 items-start group transition-all duration-300
                                    ${item.type === 'error' ? 'bg-rose-500/5 border-rose-500/20' :
                                        item.type === 'success' ? 'bg-emerald-500/5 border-emerald-500/20' :
                                            'bg-blue-500/5 border-blue-500/20'}
                                    hover:bg-white/[0.03]`}
                            >
                                <div className={`p-2 rounded-xl shrink-0 mt-0.5
                                    ${item.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                                        item.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                                            'bg-blue-500/10 text-blue-400'}`}>
                                    {item.type === 'error' ? <AlertCircle size={14} /> :
                                        item.type === 'success' ? <CheckCircle2 size={14} /> :
                                            <Zap size={14} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            {item.type.toUpperCase()} PROTOCOL
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-600">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-300 line-clamp-2 leading-relaxed tracking-tight">
                                        {item.message}
                                    </p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                            <div className="relative">
                                <Activity className="w-12 h-12 text-slate-800 animate-pulse" />
                                <div className="absolute inset-0 w-12 h-12 text-blue-500/20 animate-ping" />
                            </div>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                Listening for system telemetry...
                            </p>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="p-4 bg-white/[0.01] border-t border-white/5">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <Shield size={10} className="text-emerald-500" />
                        <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">End-to-End Encrypted</span>
                    </div>
                    <span className="text-[8px] font-black text-blue-500/50 uppercase tracking-widest">v4.0.2-STABLE</span>
                </div>
            </div>
        </motion.div>
    );
}
