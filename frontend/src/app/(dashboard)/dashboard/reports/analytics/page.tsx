'use client';

import { useState } from 'react';
import { 
    BarChart3, 
    TrendingUp, 
    Download, 
    Filter, 
    Calendar 
} from 'lucide-react';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold mb-2">
                        <BarChart3 size={13} />
                        <span>Intelligence & Reports</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Analytics & Reports
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Deep dive into workforce attendance metrics, trends, and compliance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-hidden"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last Quarter</option>
                        <option value="1y">This Year</option>
                    </select>

                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer">
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                    <BarChart3 size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Analytics & Reporting Canvas Ready
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                    Ready for your charts, KPI summaries, and exportable attendance breakdown widgets.
                </p>
            </div>
        </div>
    );
}
