'use client';

import { useState } from 'react';
import { 
    Clock, 
    CalendarDays, 
    Plus 
} from 'lucide-react';
import Link from 'next/link';

export default function SchedulePage() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                        <Clock size={13} />
                        <span>Workforce Timing</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        Work Schedule & Shifts
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
                        Define shift patterns, grace periods, rotating rosters, and break allocations.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/calendar"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold transition-colors"
                    >
                        <CalendarDays size={14} />
                        <span>View Calendar</span>
                    </Link>
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer">
                        <Plus size={14} />
                        <span>Create Shift</span>
                    </button>
                </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <Clock size={28} />
                </div>
                <h3 className="text-xl font-black text-black mb-1">
                    Work Schedule & Shifts Canvas Ready
                </h3>
                <p className="text-sm font-semibold text-slate-800 max-w-md">
                    Ready for your shift configuration matrix, time slots, and departmental assignments.
                </p>
            </div>
        </div>
    );
}
