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
    Check,
    X,
    Radio
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
        record.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = [
        { label: 'Total Recorded', value: records.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'On Time', value: records.filter(r => r.status === 'present').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Late Arrival', value: records.filter(r => r.status === 'late').length, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Active Sessions', value: records.filter(r => r.checkIn && !r.checkOut).length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];

    return (
        <div className="space-y-6 pb-8">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Live Attendance Monitor</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Real-time classroom check-in feed and biometric radar telemetry</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter live logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:border-blue-500 outline-none transition-colors shadow-2xs"
                        />
                    </div>
                    <button
                        onClick={() => fetchRecords(true)}
                        disabled={refreshing}
                        className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs disabled:opacity-50"
                        title="Refresh monitor"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Top Stats Grid & Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-3.5">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between shadow-xs"
                            >
                                <div className="flex justify-between items-center mb-2">
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

                    {/* Live Records Table Card */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Radio size={16} className="text-blue-600 animate-pulse" />
                                <h2 className="text-sm font-bold text-slate-900">Live Check-in Queue</h2>
                            </div>
                            <span className="text-xs font-semibold text-slate-400">
                                {filteredRecords.length} Active Records
                            </span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                        <th className="py-3 px-4 sm:px-5">Student / Personnel</th>
                                        <th className="py-3 px-4">Class</th>
                                        <th className="py-3 px-4">Time</th>
                                        <th className="py-3 px-4 sm:px-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                    {loading ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400">
                                                <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                                                <span className="text-xs font-medium">Loading monitor stream...</span>
                                            </td>
                                        </tr>
                                    ) : filteredRecords.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-12 text-center text-slate-400">
                                                <p className="text-xs font-medium">No active records in current window</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredRecords.map((record) => {
                                            const isPresent = record.status === 'present';
                                            const isLate = record.status === 'late';
                                            return (
                                                <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                                                    <td className="py-3 px-4 sm:px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 overflow-hidden">
                                                                {record.employeeId?.photoUrl ? (
                                                                    <img
                                                                        src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                        alt=""
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span>{record.employeeId?.firstName?.[0] || 'U'}</span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                                                    {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                                </p>
                                                                <p className="text-[11px] text-slate-400 font-mono truncate">
                                                                    {record.employeeId?.email}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-xs font-medium text-slate-600">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                                            {typeof record.employeeId?.department === 'object' ? (record.employeeId.department as any)?.name : record.employeeId?.department || 'Web 01'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 font-mono text-xs text-slate-700">
                                                        {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                                    </td>
                                                    <td className="py-3 px-4 sm:px-5 text-right">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold capitalize border shadow-2xs ${
                                                            isPresent
                                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                                : isLate
                                                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                                : 'bg-rose-50 text-rose-700 border-rose-200'
                                                        }`}>
                                                            {isPresent && <Check size={12} strokeWidth={3} className="text-emerald-600" />}
                                                            {isLate && <Clock size={12} className="text-amber-600" />}
                                                            <span>{record.status || 'present'}</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Right Column: Geofence Radar Card */}
                <div className="lg:col-span-1">
                    <GeofenceVisualizer />
                </div>
            </div>
        </div>
    );
}
