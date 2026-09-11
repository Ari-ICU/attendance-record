'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Clock,
    CheckCircle2,
    AlertCircle,
    Search,
    RefreshCw,
    Activity,
    ArrowDownRight,
    Filter,
    UserCircle
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import toast from 'react-hot-toast';
import GeofenceVisualizer from '@/components/attendance/GeofenceVisualizer';

export default function LiveMonitorPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRecords = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            const response = await AttendanceService.getRecords({ limit: 50 });
            const data = response.data?.docs || response.data || [];
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            if (isManual) toast.error('Failed to refresh data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        const interval = setInterval(() => fetchRecords(), 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredRecords = records.filter(record =>
        record.employeeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Present', value: records.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'On Time', value: records.filter(r => r.status === 'present').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Late Arrival', value: records.filter(r => r.status === 'late').length, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Active Sessions', value: records.filter(r => r.checkIn && !r.checkOut).length, icon: Activity, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Live Attendance Monitor</h1>
                    <p className="text-sm text-slate-400 mt-0.5">Real-time personnel tracking and biometric check-ins</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter live logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => fetchRecords(true)}
                        disabled={refreshing}
                        className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850 transition-colors disabled:opacity-50"
                        title="Refresh monitor"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-400' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Top Stats Grid & Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-xs font-semibold text-slate-400">
                                        {stat.label}
                                    </span>
                                    <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <span className="text-2xl font-bold text-slate-100">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <GeofenceVisualizer />
                </div>
            </div>

            {/* Activity Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                            <Clock className="w-4 h-4" />
                        </div>
                        <h2 className="text-sm font-bold text-slate-100">Live Activity Feed</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Filter className="w-3.5 h-3.5" />
                        <span>Real-time stream</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800 bg-slate-950">
                                <th className="px-5 py-3 text-xs font-semibold text-slate-400">Employee</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-400">Check In</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-400">Check Out</th>
                                <th className="px-5 py-3 text-xs font-semibold text-slate-400">Status</th>
                                <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400">Log ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-5 py-6">
                                            <div className="h-6 bg-slate-800/60 rounded-lg w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                                        <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                                        <p className="text-sm font-semibold text-slate-300">No activity reported yet</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr
                                        key={record._id}
                                        className="hover:bg-slate-800/40 transition-colors"
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                                                        {record.employeeId?.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                alt=""
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <span className="text-xs font-bold text-slate-400 uppercase">
                                                                {record.employeeId?.firstName?.[0]}{record.employeeId?.lastName?.[0]}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-slate-200 leading-tight">
                                                        {record.employeeId?.fullName || 'Unknown'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                                        {record.employeeId?.position || 'N/A'} {record.employeeId?.department ? `· ${record.employeeId.department}` : ''}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {record.checkIn ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-medium text-slate-200">
                                                        {new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 capitalize mt-0.5">
                                                        {record.checkIn.method?.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            ) : <span className="text-slate-600 text-xs">--:--</span>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {record.checkOut ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-medium text-slate-200">
                                                        {new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[10px] text-emerald-400 font-medium mt-0.5">
                                                        {record.checkOut.totalHours?.toFixed(2)} hrs
                                                    </span>
                                                </div>
                                            ) : <span className="text-slate-600 text-xs">In Progress</span>}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${getStatusStyles(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right font-mono text-xs text-slate-500">
                                            #{record._id.slice(-6).toUpperCase()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function getStatusStyles(status: string) {
    switch (status) {
        case 'present': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        case 'late': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        case 'absent': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        case 'remote': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        case 'on_leave': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
}
