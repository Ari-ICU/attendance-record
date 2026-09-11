'use client';

import { Shield, Globe } from 'lucide-react';

export default function LandingPulse() {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
            {/* Subtle Light Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:32px_32px]" />

            {/* Corner Security Badges */}
            <div className="absolute top-8 left-8 hidden lg:block">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs">
                    <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600">
                        <Shield size={15} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-emerald-700 leading-tight">Campus Security</p>
                        <p className="text-[10px] text-slate-400">Biometric Verification</p>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-8 right-8 hidden lg:block">
                <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-slate-200/80 bg-white text-slate-700 shadow-xs">
                    <div className="p-1.5 bg-blue-50 rounded-lg text-blue-600">
                        <Globe size={15} />
                    </div>
                    <div>
                        <p className="text-[11px] font-bold text-blue-700 leading-tight">Geofence Guard</p>
                        <p className="text-[10px] text-slate-400">Perimeter Active</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
