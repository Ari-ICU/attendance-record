'use client';

import { motion } from 'framer-motion';
import { MapPin, Shield, Globe, Compass } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function GeofenceVisualizer() {
    const [scans, setScans] = useState<{ id: number, x: number, y: number, color: string }[]>([]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() > 0.7) {
                const newScan = {
                    id: Date.now(),
                    x: 40 + Math.random() * 20,
                    y: 40 + Math.random() * 20,
                    color: Math.random() > 0.2 ? 'bg-emerald-500' : 'bg-amber-500'
                };
                setScans(prev => [...prev.slice(-4), newScan]);
            }
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <MapPin size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-100">Geofence Radar</h2>
                        <p className="text-[11px] text-slate-400">Perimeter: 150m Radius</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Shield size={12} />
                    <span className="text-[11px] font-semibold">Active</span>
                </div>
            </div>

            {/* Radar Center */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6 bg-slate-950/20 min-h-[260px]">
                {/* Concentric Circles */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                    {[1, 2, 3].map((ring) => (
                        <div
                            key={ring}
                            className="absolute border border-slate-800 rounded-full"
                            style={{
                                width: `${ring * 33.3}%`,
                                height: `${ring * 33.3}%`
                            }}
                        />
                    ))}

                    {/* Radar Sweep */}
                    <motion.div
                        className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-transparent to-blue-500/20 origin-bottom-left"
                        style={{ bottom: '50%', left: '50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center Pin */}
                    <div className="relative z-10 w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-none">
                        <Globe size={18} />
                    </div>

                    {/* Scans */}
                    {scans.map((scan) => (
                        <div
                            key={scan.id}
                            className={`absolute w-2.5 h-2.5 ${scan.color} rounded-full`}
                            style={{ left: `${scan.x}%`, top: `${scan.y}%` }}
                        />
                    ))}
                </div>

                {/* Coordinates */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Compass size={11} className="text-blue-400" />
                        <span>11.5564° N, 104.9282° E</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs">
                <div>
                    <p className="font-semibold text-slate-200">Main Headquarters</p>
                    <p className="text-[11px] text-slate-400">Zone Alpha</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold text-emerald-400">In Range</p>
                    <p className="text-[11px] text-slate-400">Accuracy: ±2m</p>
                </div>
            </div>
        </div>
    );
}
