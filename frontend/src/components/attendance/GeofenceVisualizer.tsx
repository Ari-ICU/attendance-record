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
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden h-full flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <MapPin size={16} />
                    </div>
                    <div>
                        <h2 className="text-sm font-bold text-slate-900">Geofence Radar</h2>
                        <p className="text-[11px] text-slate-400">Campus Radius: 150m</p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                    <Shield size={12} />
                    <span className="text-[11px] font-bold">Active</span>
                </div>
            </div>

            {/* Radar Center */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden p-6 bg-slate-50/50 min-h-[260px]">
                {/* Concentric Circles */}
                <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
                    {[1, 2, 3].map((ring) => (
                        <div
                            key={ring}
                            className="absolute border border-slate-200 rounded-full"
                            style={{
                                width: `${ring * 33.3}%`,
                                height: `${ring * 33.3}%`
                            }}
                        />
                    ))}

                    {/* Radar Sweep */}
                    <motion.div
                        className="absolute w-1/2 h-1/2 bg-gradient-to-tr from-transparent via-transparent to-blue-500/15 origin-bottom-left"
                        style={{ bottom: '50%', left: '50%' }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    />

                    {/* Center Pin */}
                    <div className="relative z-10 w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                        <Globe size={16} />
                    </div>

                    {/* Scans */}
                    {scans.map((scan) => (
                        <div
                            key={scan.id}
                            className={`absolute w-2.5 h-2.5 ${scan.color} rounded-full ring-2 ring-white shadow-xs`}
                            style={{ left: `${scan.x}%`, top: `${scan.y}%` }}
                        />
                    ))}
                </div>

                {/* Coordinates */}
                <div className="absolute bottom-3 left-4 flex flex-col gap-0.5 text-[10px] font-mono text-slate-400">
                    <div className="flex items-center gap-1.5">
                        <Compass size={11} className="text-blue-600" />
                        <span>11.5564° N, 104.9282° E</span>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                    <p className="font-bold text-slate-800">Academic Campus</p>
                    <p className="text-[11px] text-slate-400 font-medium">Zone Alpha Main</p>
                </div>
                <div className="text-right">
                    <p className="font-bold text-emerald-600">In Perimeter</p>
                    <p className="text-[11px] text-slate-400 font-medium">Accuracy: ±2m</p>
                </div>
            </div>
        </div>
    );
}
