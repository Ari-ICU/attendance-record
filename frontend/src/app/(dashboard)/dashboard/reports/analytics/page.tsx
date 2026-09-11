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
    PieChart,
    Download,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    RefreshCw,
    ShieldCheck,
    Cpu,
    Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
            toast.error('Analytics engine failed to synchronize');
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
            label: 'System Efficiency',
            value: analytics ? `${analytics.summary.systemEfficiency}%` : '0%',
            icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '+2.4%'
        },
        {
            label: 'Workforce Active',
            value: analytics ? analytics.summary.workforceActive : '0',
            icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+12'
        },
        {
            label: 'Average Compliance',
            value: analytics ? `${analytics.summary.avgCompliance}%` : '0%',
            icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '-0.5%'
        },
        {
            label: 'Operational Uptime',
            value: '99.9%',
            icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: 'STABLE'
        },
    ];

    const handleDownload = () => {
        if (!analytics) return toast.error('No data available to export');

        const headers = ['Metric', 'Value', 'Range'];
        const rows = [
            ['System Efficiency', `${analytics.summary.systemEfficiency}%`, timeRange],
            ['Workforce Active', analytics.summary.workforceActive, timeRange],
            ['Average Compliance', `${analytics.summary.avgCompliance}%`, timeRange],
            ['Biometric Success Rate', `${analytics.integrity?.faceRecognition || 0}%`, timeRange],
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
        const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' });
        link.setAttribute('download', `intel_report_${timeRange}_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Intelligence report exported');
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Workforce Intelligence & Analytics</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Operational metrics, performance analytics, and attendance distribution</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="p-1 rounded-xl bg-slate-950 border border-slate-800 flex gap-1">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleDownload}
                        className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="Export Report"
                    >
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${stat.trend.includes('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400 bg-slate-800'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <div className="space-y-0.5">
                            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                            <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Volume Chart */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-white">Attendance Volume Trend</h2>
                                <p className="text-xs text-slate-400">Daily check-in distribution across the selected time range</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                                <span>Check-Ins</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-56 flex items-end justify-between gap-2 pt-6">
                        {analytics?.attendanceDelta?.length > 0 ? (
                            analytics.attendanceDelta.map((d: any, i: number) => {
                                const maxVal = Math.max(...analytics.attendanceDelta.map((x: any) => x.count), 1);
                                const heightPercent = Math.max(8, (d.count / maxVal) * 100);
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                        <div className="relative w-full flex flex-col items-center justify-end h-44">
                                            <div
                                                style={{ height: `${heightPercent}%` }}
                                                className="w-full max-w-[28px] bg-blue-600 hover:bg-blue-500 rounded-t-md transition-all"
                                                title={`${d.count} check-ins on ${d.date}`}
                                            />
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-400 uppercase">
                                            {d.date.split('-').slice(1).join('/')}
                                        </span>
                                    </div>
                                );
                            })
                        ) : (
                            [40, 70, 45, 90, 65, 80, 85].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 opacity-30">
                                    <div className="w-full max-w-[28px] bg-slate-700 rounded-t-md" style={{ height: `${val}%` }} />
                                    <span className="text-[10px] font-mono text-slate-500">DAY</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Efficiency Breakdown */}
                <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl flex flex-col items-center justify-between text-center">
                    <div className="w-full">
                        <h2 className="text-sm sm:text-base font-bold text-white">Biometric Verification Success</h2>
                        <p className="text-xs text-slate-400 mt-0.5">Facial validation success rate</p>
                    </div>

                    <div className="relative w-40 h-40 my-4 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="80"
                                cy="80"
                                r="68"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                className="text-slate-800"
                            />
                            <circle
                                cx="80"
                                cy="80"
                                r="68"
                                stroke="currentColor"
                                strokeWidth="10"
                                fill="transparent"
                                strokeDasharray={427}
                                strokeDashoffset={427 * (1 - (analytics?.integrity?.faceRecognition / 100 || 0.95))}
                                className="text-blue-500"
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white tracking-tight">
                                {analytics ? `${analytics.integrity?.faceRecognition || 95}%` : '95%'}
                            </span>
                            <span className="text-[11px] font-medium text-blue-400 uppercase">Verified</span>
                        </div>
                    </div>

                    <div className="space-y-2.5 w-full">
                        {[
                            { label: 'Face Recognition', val: analytics ? `${analytics.integrity?.faceRecognition || 95}%` : '95%', color: 'bg-blue-500' },
                            { label: 'Manual Check', val: analytics ? `${analytics.integrity?.manualOverride || 5}%` : '5%', color: 'bg-slate-700' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-slate-400">{item.label}</span>
                                </div>
                                <span className="font-semibold text-white">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Department Performance */}
            <div className="bg-slate-900 border border-slate-800 p-5 sm:p-6 rounded-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-500/10 rounded-xl text-purple-400">
                        <Globe className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-sm sm:text-base font-bold text-white">Departmental Compliance</h2>
                        <p className="text-xs text-slate-400">Attendance compliance score across company divisions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(analytics?.entityPerformance?.length > 0 ? analytics.entityPerformance : [
                        { name: 'Engineering', score: 98 },
                        { name: 'Marketing', score: 92 },
                        { name: 'Human Resources', score: 95 },
                        { name: 'Operations', score: 89 },
                    ]).map((dept: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xs font-semibold text-slate-200 truncate">{dept.name}</h3>
                                {dept.score >= 90 ? (
                                    <span className="text-emerald-400 text-xs font-semibold flex items-center gap-0.5">
                                        <ArrowUpRight className="w-3.5 h-3.5" /> High
                                    </span>
                                ) : (
                                    <span className="text-amber-400 text-xs font-semibold flex items-center gap-0.5">
                                        <ArrowDownRight className="w-3.5 h-3.5" /> Fair
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex items-baseline justify-between text-xs">
                                    <span className="text-xl font-bold text-white">{dept.score}%</span>
                                    <span className="text-slate-500">Target: 90%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        style={{ width: `${dept.score}%` }}
                                        className={`h-full rounded-full ${dept.score >= 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

