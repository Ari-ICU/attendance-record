'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AttendanceService } from '@/services/attendance.service';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    XCircle,
    Calendar,
    BookOpen,
    QrCode,
    Camera,
    Sparkles,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';

export default function PortalPage() {
    const { user } = useAuth();
    const [records, setRecords] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalDays: 45,
        present: 42,
        late: 2,
        absent: 1,
        rate: 96,
    });

    useEffect(() => {
        const fetchPersonalRecords = async () => {
            try {
                setLoading(true);
                // Fetch attendance records for this user/employee
                const res = await AttendanceService.getRecords({ limit: 10 });
                if (res?.data) {
                    setRecords(res.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonalRecords();
    }, []);

    const todaySchedule = [
        { name: 'Engineering Daily Standup & Sprint Sync', code: 'ENG-SYNC', time: '09:00 AM - 09:45 AM', room: 'Conference Room 4A', status: 'Completed', lead: 'Tech Lead / Architect' },
        { name: 'Product Design & Architecture Review', code: 'PROD-REV', time: '02:00 PM - 03:30 PM', room: 'Design Studio B', status: 'Upcoming', lead: 'Sarah Jenkins' },
    ];

    return (
        <div className="w-full space-y-6 max-w-7xl mx-auto">
            {/* Greeting & Quick Action Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                        {user?.firstName?.[0] || 'E'}{user?.lastName?.[0] || 'M'}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                Hello, {user?.firstName || 'Employee'} 👋
                            </h1>
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                <span>Active Staff Member</span>
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                            ID: <span className="font-mono text-slate-700 font-medium">{user?._id?.substring(0, 10).toUpperCase() || 'EMP-2026-081'}</span> • Fiscal Year 2026
                        </p>
                    </div>
                </div>

                {/* Quick Staff Clock-In Actions */}
                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/dashboard/attendance/scan"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                    >
                        <Camera size={15} className="text-emerald-400" />
                        <span>Face Scan Check-In</span>
                    </Link>

                    <Link
                        href="/dashboard/attendance/scan"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-black border border-slate-300 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 cursor-pointer"
                    >
                        <QrCode size={15} />
                        <span>QR Code Scanner</span>
                    </Link>
                </div>
            </div>

            {/* Bento Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Overall Attendance Rate */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{stats.rate}%</span>
                        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">+2.4%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-blue-600 h-full rounded-full" style={{ width: `${stats.rate}%` }} />
                    </div>
                </div>

                {/* Present */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Present</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{stats.present}</span>
                        <span className="text-xs text-slate-400">/ {stats.totalDays} sessions</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">93.3% on-time arrival</p>
                </div>

                {/* Late */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Late Check-ins</span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{stats.late}</span>
                        <span className="text-xs text-slate-400">instances</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Average 8 mins delay</p>
                </div>

                {/* Absent */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Days Absent</span>
                        <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                            <XCircle size={16} />
                        </div>
                    </div>
                    <div className="mt-3 flex items-baseline gap-2">
                        <span className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight font-mono">{stats.absent}</span>
                        <span className="text-xs text-slate-400">day</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 font-medium">Excused leave filed</p>
                </div>
            </div>

            {/* Grid 2-cols: Today's Schedule & Attendance History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left (2 cols): My Attendance History */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Recent Attendance Logs</h2>
                            <p className="text-xs text-slate-400">Biometric check-in verification records</p>
                        </div>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                            Live Sync
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Check In</th>
                                    <th className="px-5 py-3">Check Out</th>
                                    <th className="px-5 py-3">Method</th>
                                    <th className="px-5 py-3 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {records.length > 0 ? (
                                    records.slice(0, 5).map((rec: any, idx: number) => {
                                        const isPresent = rec.status === 'present';
                                        const isLate = rec.status === 'late';
                                        return (
                                            <tr key={rec._id || idx} className="hover:bg-slate-50/70 transition-colors">
                                                <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                                                    {rec.date ? format(new Date(rec.date), 'EEE, MMM d, yyyy') : 'Today'}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">
                                                    {rec.checkInTime || '08:04 AM'}
                                                </td>
                                                <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">
                                                    {rec.checkOutTime || '05:01 PM'}
                                                </td>
                                                <td className="px-5 py-3.5 whitespace-nowrap">
                                                    <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                                        <ShieldCheck size={13} className="text-blue-600" />
                                                        <span>Face Bio</span>
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                        isPresent
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                            : isLate
                                                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border border-rose-200'
                                                    }`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${isPresent ? 'bg-emerald-500' : isLate ? 'bg-amber-500' : 'bg-rose-500'}`} />
                                                        <span className="capitalize">{rec.status || 'Present'}</span>
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    // Fallback demo rows if server has no seeded items for this user
                                    [
                                        { date: 'Friday, Sep 11', in: '08:02 AM', out: '--', status: 'present', method: 'Face Bio' },
                                        { date: 'Thursday, Sep 10', in: '08:05 AM', out: '05:00 PM', status: 'present', method: 'Face Bio' },
                                        { date: 'Wednesday, Sep 9', in: '08:24 AM', out: '04:55 PM', status: 'late', method: 'Face Bio' },
                                        { date: 'Tuesday, Sep 8', in: '08:01 AM', out: '05:02 PM', status: 'present', method: 'Face Bio' },
                                        { date: 'Monday, Sep 7', in: '07:58 AM', out: '05:00 PM', status: 'present', method: 'Face Bio' },
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                                            <td className="px-5 py-3.5 font-medium text-slate-800 whitespace-nowrap">{row.date}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-700 whitespace-nowrap">{row.in}</td>
                                            <td className="px-5 py-3.5 font-mono text-slate-500 whitespace-nowrap">{row.out}</td>
                                            <td className="px-5 py-3.5 whitespace-nowrap">
                                                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                                                    <ShieldCheck size={13} className="text-blue-600" />
                                                    <span>{row.method}</span>
                                                </span>
                                            </td>
                                            <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    row.status === 'present'
                                                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                                                }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${row.status === 'present' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                    <span className="capitalize">{row.status}</span>
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right (1 col): Today's Schedule & Digital ID Badge */}
                <div className="space-y-4">
                    {/* Today's Schedule Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Work Schedule</h3>
                            <span className="text-xs font-medium text-slate-400">2 Sessions</span>
                        </div>

                        <div className="space-y-3">
                            {todaySchedule.map((cls, idx) => (
                                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-900">{cls.name}</span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            cls.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                                        }`}>
                                            {cls.status}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 flex items-center gap-2">
                                        <span>⏰ {cls.time}</span>
                                        <span>📍 {cls.room}</span>
                                    </p>
                                    <p className="text-[10px] text-slate-400">Coordinator / Lead: {cls.lead}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Biometric Status Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                                <ShieldCheck size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-900">Face ID Registered</p>
                                <p className="text-[11px] text-slate-400">High-speed verification active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
