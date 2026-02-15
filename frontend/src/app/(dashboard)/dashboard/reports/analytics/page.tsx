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
import { AttendanceService } from '@/services/attendance.service';
import { EmployeeService } from '@/services/employee.service';
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
            ['Biometric Success Rate', `${analytics.integrity.faceRecognition}%`, timeRange],
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
        link.setAttribute('download', `intel_report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Intelligence report exported');
    };


    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-2">
                        <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Neural Intelligence Active</span>
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tight italic">Workforce Intelligence</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Advanced operational metrics and behavioral analytics</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="p-1 rounded-2xl bg-white/5 border border-white/10 flex gap-1">
                        {['24h', '7d', '30d', '90d'].map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-slate-500 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                {range}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleDownload}
                        className="p-3 rounded-2xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all group active:scale-95"
                    >
                        <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>

            {/* KPI Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="glass-pane p-6 rounded-3xl border border-white/10 relative group hover:border-blue-500/30 transition-all duration-500"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${stat.trend.includes('+') ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 bg-white/5'}`}>
                                {stat.trend}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-3xl font-black text-white">{stat.value}</p>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</p>
                        </div>

                        {/* Subtle sparkline overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 overflow-hidden rounded-b-3xl">
                            <motion.div
                                initial={{ x: '-100%' }}
                                animate={{ x: '0%' }}
                                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                                className={`h-full ${stat.color.replace('text', 'bg')}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Charts Mockup Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Attendance Volume Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 glass-pane p-8 rounded-[2.5rem] border border-white/10"
                >
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Attendance Delta</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Aggregate check-in volume vs timeline</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Actual</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-white/20" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Projected</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-3">
                        {analytics?.attendanceDelta?.length > 0 ? (
                            analytics.attendanceDelta.map((d: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                    <div className="relative w-full flex flex-col items-center justify-end h-full">
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${Math.min(100, (d.count / (analytics.summary.workforceActive || 1)) * 100)}%` }}
                                            transition={{ duration: 1, delay: 0.5 + (i * 0.05) }}
                                            className="w-full bg-gradient-to-t from-blue-600/80 to-blue-400 rounded-t-lg group-hover:to-blue-300 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                                        />
                                    </div>
                                    <span className="text-[8px] font-black text-slate-600 group-hover:text-blue-400 transition-colors uppercase">
                                        {d.date.split('-').slice(1).join('/')}
                                    </span>
                                </div>
                            ))
                        ) : (
                            [40, 70, 45, 90, 65, 80].map((val, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-4 group opacity-20">
                                    <div className="w-full bg-white/10 rounded-t-lg h-full" style={{ height: `${val}%` }} />
                                    <span className="text-[8px] font-black text-slate-800 uppercase">CALC</span>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>

                {/* Efficiency Breakdown (Circular) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass-pane p-8 rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center text-center"
                >
                    <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2 italic">Global Integrity</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-10">Verification Protocol Success Rate</p>

                    <div className="relative w-48 h-48 mb-8">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                className="text-white/5"
                            />
                            <motion.circle
                                cx="96"
                                cy="96"
                                r="88"
                                stroke="currentColor"
                                strokeWidth="12"
                                fill="transparent"
                                strokeDasharray={553}
                                initial={{ strokeDashoffset: 553 }}
                                animate={{ strokeDashoffset: 553 * (1 - (analytics?.integrity?.faceRecognition / 100 || 0.948)) }}
                                transition={{ duration: 2, delay: 1 }}
                                className="text-blue-500 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-black text-white tracking-tighter">
                                {analytics ? `${analytics.integrity.faceRecognition}%` : '---'}
                            </span>
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Optimized</span>
                        </div>
                    </div>

                    <div className="space-y-4 w-full px-4">
                        {[
                            { label: 'Face Recognition', val: analytics ? `${analytics.integrity.faceRecognition}%` : '---', color: 'bg-blue-500' },
                            { label: 'Manual Override', val: analytics ? `${analytics.integrity.manualOverride}%` : '---', color: 'bg-white/10' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${item.color}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                </div>
                                <span className="text-[10px] font-black text-white">{item.val}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Bottom Row - Departmental Metrics */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="glass-pane p-8 rounded-[2.5rem] border border-white/10"
            >
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 text-purple-400">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Entity Performance</h2>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Inter-departmental compliance metrics</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {(analytics?.entityPerformance?.length > 0 ? analytics.entityPerformance : [
                        { name: 'Eng', score: 98, trend: 'up' },
                        { name: 'Research', score: 92, trend: 'up' },
                        { name: 'Security', score: 85, trend: 'down' },
                        { name: 'Ops', score: 89, trend: 'up' },
                    ]).map((dept: any, i: number) => (
                        <div key={i} className="space-y-4 p-5 rounded-3xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                            <div className="flex justify-between items-start">
                                <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider italic leading-tight max-w-[100px]">{dept.name}</h3>
                                {dept.score >= 90 ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-rose-400" />}
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-end justify-between">
                                    <span className="text-2xl font-black text-white">{dept.score}%</span>
                                    <span className="text-[8px] font-bold text-slate-500 uppercase">Target: 95%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dept.score}%` }}
                                        transition={{ duration: 1.5, delay: 0.8 + (i * 0.1) }}
                                        className={`h-full bg-gradient-to-r ${dept.score >= 90 ? 'from-blue-500 to-emerald-500' : 'from-blue-500 to-amber-500'}`}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
