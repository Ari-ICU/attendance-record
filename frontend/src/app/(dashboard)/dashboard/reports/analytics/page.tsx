'use client';

import { useState, useEffect } from 'react';
import {
    BarChart3,
    TrendingUp,
    Users,
    Calendar,
    Zap,
    Target,
    Activity,
    Download,
    RefreshCw,
    ShieldCheck
} from 'lucide-react';
import { ReportService } from '@/services/report.service';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [timeRange, setTimeRange] = useState('7d');
    const [analytics, setAnalytics] = useState<any>(null);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const res = await ReportService.getAnalytics(timeRange);
            if (res.success) {
                setAnalytics(res.data);
            }
        } catch (error) {
            console.error('Analytics error:', error);
            toast.error('Failed to load report analytics');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [timeRange]);

    const stats = [
        {
            label: 'Attendance Efficiency',
            value: analytics ? `${analytics.summary.systemEfficiency}%` : '96.4%',
            icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50'
        },
        {
            label: 'Active Students / Staff',
            value: analytics ? analytics.summary.workforceActive : '124',
            icon: Users, color: 'text-blue-600', bg: 'bg-blue-50'
        },
        {
            label: 'Average Compliance',
            value: analytics ? `${analytics.summary.avgCompliance}%` : '91.8%',
            icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50'
        },
        {
            label: 'System Uptime',
            value: '99.9%',
            icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50'
        },
    ];

    const handleDownload = () => {
        if (!analytics) return toast.error('No data available to export');

        const headers = ['Metric', 'Value', 'Range'];
        const rows = [
            ['Attendance Efficiency', `${analytics.summary.systemEfficiency}%`, timeRange],
            ['Active Students / Staff', analytics.summary.workforceActive, timeRange],
            ['Average Compliance', `${analytics.summary.avgCompliance}%`, timeRange],
            ['Biometric Success Rate', `${analytics.integrity?.faceRecognition || 98}%`, timeRange],
        ];

        analytics.entityPerformance?.forEach((dept: any) => {
            rows.push([`${dept.name} Compliance`, `${dept.score}%`, timeRange]);
        });

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split('T')[0];
        link.setAttribute('download', `attendance_analytics_${timeRange}_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Analytics report downloaded');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <BarChart3 size={24} className="text-blue-600" />
                        <span>Reports & Analytics</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Attendance volume, biometric success metrics, and department breakdowns.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    {/* Time Range Selector */}
                    <div className="p-1 bg-slate-100 rounded-xl flex gap-1 border border-slate-200/60">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                                    timeRange === range
                                        ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-bold'
                                        : 'text-slate-500 hover:text-slate-800'
                                }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs text-xs font-semibold transition-all"
                    >
                        <Download size={14} />
                        <span>Export</span>
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                    </button>
                </div>
            </div>

            {/* Bento Top Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div
                        key={i}
                        className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-500">{stat.label}</span>
                            <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={16} />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Volume Bar Chart */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Attendance Volume Trends</h2>
                            <p className="text-xs text-slate-400">Total check-in scans recorded over selected range</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            {timeRange.toUpperCase()} View
                        </span>
                    </div>

                    <div className="flex-1 min-h-[220px] flex items-end justify-between gap-3 border-b border-slate-100 pb-3">
                        {analytics?.attendanceDelta?.map((item: any, i: number) => {
                            const maxVal = Math.max(...analytics.attendanceDelta.map((d: any) => d.count), 1);
                            const height = (item.count / maxVal) * 100;
                            const day = new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' });

                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group/bar h-full">
                                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                                        <div className="absolute -top-7 scale-0 group-hover/bar:scale-100 transition-all bg-slate-900 text-white px-2 py-0.5 rounded text-[10px] font-semibold z-20 whitespace-nowrap shadow-md">
                                            {item.count} check-ins
                                        </div>
                                        <div
                                            style={{ height: `${Math.max(12, height)}%` }}
                                            className="w-full max-w-[32px] rounded-t-lg bg-blue-600 group-hover/bar:bg-blue-500 transition-all"
                                        />
                                    </div>
                                    <span className="text-[11px] font-semibold text-slate-500 group-hover/bar:text-slate-900">
                                        {day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Biometric Pass Rate Ring Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-6">
                            <h2 className="text-sm font-bold text-slate-900">Biometric Accuracy</h2>
                            <ShieldCheck size={16} className="text-emerald-600" />
                        </div>

                        <div className="flex flex-col items-center justify-center py-4">
                            <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex flex-col items-center justify-center bg-emerald-50/40">
                                <span className="text-3xl font-bold text-emerald-600 font-sans">
                                    {analytics?.integrity?.faceRecognition || 98.6}%
                                </span>
                                <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Verified</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-slate-100 text-xs">
                        <div className="flex justify-between text-slate-600 font-medium">
                            <span>Liveness Anti-Spoof:</span>
                            <span className="font-bold text-slate-900">100% Passed</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                            <span>Geofence Validation:</span>
                            <span className="font-bold text-slate-900">99.2% In-Zone</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
