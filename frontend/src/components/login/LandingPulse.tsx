'use client';

import { Shield, Globe } from 'lucide-react';

export default function LandingPulse() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Flat Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b20_1px,transparent_1px),linear-gradient(to_bottom,#1e293b20_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Flat Corner Security Badges */}
            <div className="absolute top-8 left-8 hidden lg:block">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 shadow-none">
                    <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <Shield size={16} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-emerald-400 leading-tight">Anti-Spoofing Active</p>
                        <p className="text-[10px] text-slate-400">Neural Liveness Verified</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 hidden lg:block">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 shadow-none">
                    <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                        <Globe size={16} />
                    </div>
                    <div>
                        <p className="text-[11px] font-semibold text-blue-400 leading-tight">Geofence Guard</p>
                        <p className="text-[10px] text-slate-400">Perimeter Integrity Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
