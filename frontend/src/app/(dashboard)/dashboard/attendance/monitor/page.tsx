'use client';

import { useState } from 'react';
import { 
    Clock, 
    RefreshCw, 
    Radio,
    Search
} from 'lucide-react';

export default function LiveMonitorPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2">
                        <Radio size={13} className="animate-pulse" />
                        <span>Real-Time Monitor</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        Today's Attendance
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
                        Live monitoring of check-ins, check-outs, and biometric verification events.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search staff..."
                            className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-black font-semibold placeholder-slate-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-48 sm:w-64"
                        />
                    </div>
                    <button className="p-2.5 rounded-xl border border-slate-200 text-black hover:bg-slate-50 transition-colors cursor-pointer" title="Refresh">
                        <RefreshCw size={15} />
                    </button>
                </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <Clock size={28} />
                </div>
                <h3 className="text-xl font-black text-black mb-1">
                    Live Attendance Monitor Canvas Ready
                </h3>
                <p className="text-sm font-semibold text-slate-800 max-w-md">
                    Ready for your real-time attendance feed, live stream cards, and biometric logs.
                </p>
            </div>
        </div>
    );
}
