'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { ReportService } from '@/services/report.service';

export default function ActivityAnalytics() {
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);

    const fetchData = async () => {
        try {
            const res = await ReportService.getAnalytics('7d');
            if (res.success) {
                setAnalytics(res.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center shadow-xs">
                <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mb-3" />
                <p className="text-slate-400 font-medium text-xs">Loading analytics reports...</p>
            </div>
        );
    }

    const attendanceDelta = analytics?.attendanceDelta || [];
    const maxCount = Math.max(...attendanceDelta.map((d: any) => d.count), 1);

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 flex flex-col min-h-[380px] shadow-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Attendance Trends</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Daily check-in volume over the last 7 days
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-semibold">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Past 7 Days</span>
                </div>
            </div>

            {/* Material Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-2 mb-6 h-36 border-b border-slate-100 pb-2">
                {attendanceDelta.length > 0 ? (
                    attendanceDelta.map((data: any, i: number) => {
                        const height = (data.count / maxCount) * 100;
                        const date = new Date(data.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full">
                                <div className="relative w-full flex flex-col items-center justify-end h-full">
                                    {/* Tooltip */}
                                    <div className="absolute -top-8 scale-0 group-hover/bar:scale-100 transition-all duration-150 bg-slate-900 text-white px-2 py-0.5 rounded text-[11px] font-semibold whitespace-nowrap z-20 shadow-md">
                                        {data.count} present
                                    </div>

                                    <div
                                        style={{ height: `${Math.max(10, height)}%` }}
                                        className="w-full max-w-[28px] rounded-t-lg bg-blue-600 group-hover/bar:bg-blue-500 transition-all"
                                    />
                                </div>
                                <span className="text-[11px] font-semibold text-slate-500 group-hover/bar:text-slate-900 transition-colors">
                                    {dayName}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full flex items-center justify-center text-slate-400 text-xs font-medium">
                        No activity records for this cycle
                    </div>
                )}
            </div>

            {/* Quick Summary Metrics */}
            <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-xs text-slate-500 font-semibold">System Accuracy</p>
                    <p className="text-xl font-bold text-slate-900 mt-1 font-sans">{analytics?.summary?.systemEfficiency || '98.5'}%</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <p className="text-xs text-slate-500 font-semibold">On-Time Compliance</p>
                    <p className="text-xl font-bold text-emerald-600 mt-1 font-sans">{analytics?.summary?.avgCompliance || '91.2'}%</p>
                </div>
            </div>
        </div>
    );
}
