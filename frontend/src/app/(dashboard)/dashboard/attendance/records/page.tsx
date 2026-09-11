'use client';

import { useState } from 'react';
import { 
    Calendar, 
    Download, 
    FileSpreadsheet 
} from 'lucide-react';

export default function AttendanceRecordsPage() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                        <Calendar size={13} />
                        <span>Attendance Log</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        Attendance Records
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
                        Filter, inspect, and export historical employee attendance data.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold transition-colors cursor-pointer">
                        <Download size={14} />
                        <span>Export CSV</span>
                    </button>
                </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                    <FileSpreadsheet size={28} />
                </div>
                <h3 className="text-xl font-black text-black mb-1">
                    Attendance Records Canvas Ready
                </h3>
                <p className="text-sm font-semibold text-slate-800 max-w-md">
                    Ready for your updated data tables, date-range filters, and export workflows.
                </p>
            </div>
        </div>
    );
}
