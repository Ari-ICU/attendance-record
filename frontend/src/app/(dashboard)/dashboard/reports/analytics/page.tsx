'use client';

import { useState } from 'react';
import { 
    BarChart3, 
    Download 
} from 'lucide-react';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function AnalyticsPage() {
    const [timeRange, setTimeRange] = useState('7d');

    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
                        <BarChart3 size={13} />
                        <span>Intelligence & Reports</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                        Analytics & Reports
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-0.5">
                        Deep dive into workforce attendance metrics, trends, and compliance.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-40">
                        <CustomDropdown
                            value={timeRange}
                            onChange={(val) => setTimeRange(val)}
                            options={[
                                { value: '7d', label: 'Last 7 Days' },
                                { value: '30d', label: 'Last 30 Days' },
                                { value: '90d', label: 'Last Quarter' },
                                { value: '1y', label: 'This Year' }
                            ]}
                        />
                    </div>

                    <button className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold transition-colors cursor-pointer whitespace-nowrap">
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
                <h3 className="text-xl font-black text-black mb-1">
                    Analytics & Reporting Canvas Ready
                </h3>
                <p className="text-sm font-semibold text-slate-800 max-w-md">
                    Ready for your charts, KPI summaries, and exportable attendance breakdown widgets.
                </p>
            </div>
        </div>
    );
}
