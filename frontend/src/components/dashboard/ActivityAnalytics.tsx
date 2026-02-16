'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, BarChart3, Zap } from 'lucide-react';
import { ReportService } from '@/services/report.service';
import toast from 'react-hot-toast';

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
            // Don't show toast on dashboard to avoid annoyance
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="glass-pane rounded-3xl shadow-xl p-8 flex flex-col items-center justify-center min-h-[300px] text-center relative overflow-hidden">
                <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
                <p className="text-slate-400 font-medium">Synchronizing reports...</p>
            </div>
        );
    }

    const attendanceDelta = analytics?.attendanceDelta || [];
    const maxCount = Math.max(...attendanceDelta.map((d: any) => d.count), 1);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-pane rounded-3xl shadow-xl p-8 flex flex-col min-h-[400px] relative overflow-hidden group"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white italic tracking-tight">Active Insights</h3>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-1">
                            Attendance trends last 7 days
                        </p>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                        <Zap size={10} className="text-emerald-400 animate-pulse" />
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            </div>

            {/* Simple Bar Chart */}
            <div className="flex-1 flex items-end justify-between gap-1 sm:gap-2 mb-8 h-40 relative z-10">
                {attendanceDelta.length > 0 ? (
                    attendanceDelta.map((data: any, i: number) => {
                        const height = (data.count / maxCount) * 100;
                        const date = new Date(data.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

                        return (
                            <div key={i} className="flex-1 flex flex-col items-center gap-3 group/bar h-full">
                                <div className="relative w-full flex flex-col items-center justify-end h-full">
                                    {/* Tooltip */}
                                    <div className="absolute -top-10 scale-0 group-hover/bar:scale-100 transition-all duration-200 bg-slate-900 border border-white/10 px-2 py-1 rounded text-[10px] font-black text-white whitespace-nowrap z-20">
                                        {data.count} Scans
                                    </div>

                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(10, height)}%` }}
                                        transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                                        className={`w-full max-w-[24px] rounded-t-lg bg-gradient-to-t from-blue-600/50 to-blue-400 group-hover/bar:from-blue-500 group-hover/bar:to-blue-300 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]`}
                                    />
                                </div>
                                <span className="text-[9px] font-black text-slate-500 group-hover/bar:text-blue-400 transition-colors uppercase">
                                    {dayName[0]}
                                </span>
                            </div>
                        );
                    })
                ) : (
                    <div className="w-full flex items-center justify-center text-slate-500 text-xs font-medium italic">
                        Insufficient data for telemetry visualization
                    </div>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mt-auto relative z-10">
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 group/stat hover:bg-white/[0.06] transition-colors">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Efficiency</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white italic">{analytics?.summary?.systemEfficiency || '95.0'}%</span>
                        <BarChart3 className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    </div>
                </div>
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1 group/stat hover:bg-white/[0.06] transition-colors">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Compliance</p>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-white italic">{analytics?.summary?.avgCompliance || '88.5'}%</span>
                        <Activity className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover/stat:opacity-100 transition-opacity" />
                    </div>
                </div>
            </div>

            {/* Animated background lines */}
            <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/20 to-transparent animate-pulse" />
        </motion.div>
    );
}
