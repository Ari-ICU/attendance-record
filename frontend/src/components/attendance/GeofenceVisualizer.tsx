'use client';

import { motion } from 'framer-motion';
import { MapPin, Shield, Zap, Globe, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GeofenceVisualizer() {
    const [scans, setScans] = useState<{ id: number, x: number, y: number, color: string }[]>([]);

    // Simulate live scans for the "wow" factor
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newScan = {
                    id: Date.now(),
                    x: 40 + Math.random() * 20,
                    y: 40 + Math.random() * 20,
                    color: Math.random() > 0.2 ? 'text-emerald-500' : 'text-amber-500'
                };
                setScans(prev => [...prev.slice(-4), newScan]);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-pane rounded-[2.5rem] border border-white/10 overflow-hidden h-full flex flex-col relative"
        >
            <div className="p-6 border-b border-white/5 flex items-center justify-between relative z-10 bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                        <MapPin size={18} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-white uppercase tracking-widest italic">Live Geofence Radar</h2>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Perimeter: 150m Radius</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <Shield size={10} className="text-emerald-400 animate-pulse" />
                    <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest">Secured</span>
                </div>
            </div>

            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-8">
                {/* Radar background grid */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                    <div className="absolute inset-0 grid grid-cols-12 gap-0 border-white/5">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="border-r border-white/5 h-full" />
                        ))}
                    </div>
                    <div className="absolute inset-0 grid grid-rows-12 gap-0 border-white/5">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="border-b border-white/5 w-full" />
                        ))}
                    </div>
                </div>

                {/* Concentric Radar Rings */}
                <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
                    {[1, 2, 3].map((ring) => (
                        <div
                            key={ring}
                            className={`absolute border rounded-full border-blue-500/10`}
                            style={{
                                width: `${ring * 33.3}%`,
                                height: `${ring * 33.3}%`
                            }}
                        >
                            {ring === 3 && (
                                <motion.div
                                    className="absolute inset-0 border-2 border-dashed border-emerald-500/30 rounded-full"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                />
                            )}
                        </div>
                    ))}

                    {/* Radar Sweep */}
                    <motion.div
                        className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-transparent to-blue-500/20 origin-bottom-left"
                        style={{ bottom: '50%', left: '50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center Point */}
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                            <Globe size={24} className="text-blue-400 animate-pulse" />
                        </div>
                    </div>

                    {/* Simulated Personnel Scans */}
                    {scans.map((scan) => (
                        <motion.div
                            key={scan.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`absolute w-3 h-3 rounded-full flex items-center justify-center`}
                            style={{ left: `${scan.x}%`, top: `${scan.y}%` }}
                        >
                            <div className={`w-full h-full ${scan.color.replace('text', 'bg')} rounded-full animate-ping opacity-75`} />
                            <div className={`absolute inset-0 ${scan.color.replace('text', 'bg')} rounded-full`} />
                        </motion.div>
                    ))}
                </div>

                {/* Coordinates overlay */}
                <div className="absolute bottom-6 left-6 flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <Compass size={10} className="text-blue-400" />
                        Lat: 11.5564° N
                    </div>
                    <div className="flex items-center gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <Zap size={10} className="text-amber-400" />
                        Long: 104.9282° E
                    </div>
                </div>
            </div>

            <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-white italic tracking-widest uppercase">Office HQ</p>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Verified Cluster 01</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-emerald-400 italic">GEOFENCE ACTIVE</p>
                    <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Signal Strength: 100%</p>
                </div>
            </div>
        </motion.div>
    );
}
