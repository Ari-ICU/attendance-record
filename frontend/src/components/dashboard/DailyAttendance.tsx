'use client';

import { useEffect, useState, useCallback } from 'react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import { RefreshCw, Clock, MapPin, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DailyAttendance() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchTodaysAttendance = useCallback(async (isAutoRefresh = false) => {
        try {
            if (!isAutoRefresh) setLoading(true);
            else setRefreshing(true);

            const response = await AttendanceService.getRecords({ limit: 50 });
            const data = response.data?.docs || response.data || [];

            setRecords(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            if (!isAutoRefresh) toast.error('Failed to load telemetry');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTodaysAttendance();
        const intervalId = setInterval(() => fetchTodaysAttendance(true), 30000);
        return () => clearInterval(intervalId);
    }, [fetchTodaysAttendance]);

    const totalPresent = records.filter(r => r.status === 'present').length;
    const totalLate = records.filter(r => r.status === 'late').length;
    const currentlyClockedIn = records.filter(r => r.checkIn?.time && !r.checkOut?.time).length;

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-950/40">
                <div>
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                            <Clock className="w-5 h-5" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-100">Daily Attendance</h2>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                        Live activity feed · {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider hidden sm:block">Last Sync</span>
                        <span className="text-xs font-mono text-slate-300">
                            {lastUpdated.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={() => fetchTodaysAttendance(false)}
                        disabled={refreshing || loading}
                        className={`p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors ${refreshing ? 'animate-spin text-blue-400' : ''}`}
                        title="Refresh attendance"
                    >
                        <RefreshCw size={16} />
                    </button>
                </div>
            </div>

            {/* Flat Stats Cards */}
            <div className="grid grid-cols-3 gap-3 p-5 border-b border-slate-800 bg-slate-950/20">
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400">Present</span>
                        <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
                            <UserCheck size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{totalPresent}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400">Late</span>
                        <div className="p-1.5 bg-amber-500/10 rounded-lg text-amber-400">
                            <UserX size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{totalLate}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-400">Active Now</span>
                        <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-400">
                            <Clock size={15} />
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-100">{currentlyClockedIn}</p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto overflow-y-auto max-h-[460px]">
                {loading && !refreshing ? (
                    <div className="p-16 text-center space-y-3">
                        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto" />
                        <p className="text-xs text-slate-400">Loading records...</p>
                    </div>
                ) : records.length === 0 ? (
                    <div className="p-16 text-center flex flex-col items-center">
                        <UserX size={40} className="text-slate-700 mb-3" />
                        <h4 className="text-sm font-semibold text-slate-300">No Attendance Records</h4>
                        <p className="text-xs text-slate-500 mt-1">No check-in activity recorded for today yet.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead className="sticky top-0 z-10 bg-slate-950 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400">Employee</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400">Check In</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400">Check Out</th>
                                <th className="px-6 py-3.5 text-xs font-semibold text-slate-400">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {records.map((record) => (
                                <tr key={record._id} className="hover:bg-slate-800/40 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-slate-800 overflow-hidden shrink-0 border border-slate-700 flex items-center justify-center">
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
                                            <div>
                                                <div className="text-sm font-semibold text-slate-200">
                                                    {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                </div>
                                                <div className="text-xs text-slate-500 mt-0.5">
                                                    {record.employeeId?.position} {record.employeeId?.department ? `· ${record.employeeId?.department}` : ''}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.checkIn?.time ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-medium text-slate-200">
                                                        {new Date(record.checkIn.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {record.checkIn.location && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${record.checkIn.location.latitude},${record.checkIn.location.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                                                            title="View location"
                                                        >
                                                            <MapPin size={11} />
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-slate-500 mt-0.5 capitalize">{record.checkIn.method.replace('_', ' ')}</span>
                                            </div>
                                        ) : <span className="text-slate-600 text-xs">--:--</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {record.checkOut?.time ? (
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-mono font-medium text-slate-200">
                                                        {new Date(record.checkOut.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    {record.checkOut.location && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${record.checkOut.location.latitude},${record.checkOut.location.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 bg-slate-800 rounded border border-slate-700 text-slate-400 hover:text-blue-400 transition-colors"
                                                            title="View location"
                                                        >
                                                            <MapPin size={11} />
                                                        </a>
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-emerald-400 font-medium mt-0.5">{record.checkOut.totalHours?.toFixed(2)} hrs</span>
                                            </div>
                                        ) : record.checkIn?.time ? (
                                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                                In Progress
                                            </span>
                                        ) : <span className="text-slate-600 text-xs">--:--</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium capitalize border
                                            ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                record.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-400 border-rose-500/20'}
                                        `}>
                                            {record.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
