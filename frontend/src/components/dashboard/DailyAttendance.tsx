'use client';

import { useEffect, useState, useCallback } from 'react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import { RefreshCw, Clock, MapPin, UserCheck, UserX } from 'lucide-react';
import { format } from 'date-fns';
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

            const today = new Date();
            const dateStr = format(today, 'yyyy-MM-dd');

            // Fetch records for today
            const response = await AttendanceService.getRecords({
                startDate: dateStr,
                endDate: dateStr
            });

            const data = response.data || [];

            setRecords(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            if (!isAutoRefresh) toast.error('Failed to load today\'s attendance');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchTodaysAttendance();

        // Auto-refresh every 30 seconds
        const intervalId = setInterval(() => {
            fetchTodaysAttendance(true);
        }, 30000);

        return () => clearInterval(intervalId);
    }, [fetchTodaysAttendance]);

    // Calculate Summary Stats
    const totalPresent = records.filter(r => r.checkIn?.time).length;
    const currentlyClockedIn = records.filter(r => r.checkIn?.time && !r.checkOut?.time).length;

    return (
        <div className="glass-pane rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-500/10">
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/5">
                <div>
                    <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 flex items-center gap-3">
                        <div className="p-2 bg-blue-500/20 rounded-xl">
                            <Clock className="text-blue-400" size={24} />
                        </div>
                        Today's Attendance
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="relative flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </span>
                        <p className="text-sm font-medium text-slate-400">
                            Live updates for {format(new Date(), 'MMMM d, yyyy')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
                    <span className="text-xs font-medium text-slate-500 px-2 hidden sm:inline-block">
                        Updated: {format(lastUpdated, 'h:mm:ss a')}
                    </span>
                    <button
                        onClick={() => fetchTodaysAttendance(false)}
                        disabled={refreshing || loading}
                        className={`p-2 rounded-lg text-slate-400 hover:bg-white/10 hover:text-blue-400 transition-all shadow-sm ${refreshing ? 'animate-spin text-blue-400' : ''}`}
                        title="Refresh"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 gap-4 p-6 sm:p-8 bg-black/20">
                <div className="bg-emerald-500/10 p-5 rounded-xl border border-emerald-500/10 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-emerald-500/20 rounded-xl shadow-sm text-emerald-400 ring-4 ring-emerald-500/5">
                        <UserCheck size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-emerald-400/80 uppercase tracking-wider">Present</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">{totalPresent}</p>
                    </div>
                </div>
                <div className="bg-blue-500/10 p-5 rounded-xl border border-blue-500/10 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                    <div className="p-3 bg-blue-500/20 rounded-xl shadow-sm text-blue-400 ring-4 ring-blue-500/5">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-blue-400/80 uppercase tracking-wider">Active Now</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mt-0.5">{currentlyClockedIn}</p>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="overflow-hidden">
                <div className="overflow-x-auto max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
                    {loading && !refreshing && records.length === 0 ? (
                        <div className="p-12 text-center text-slate-500 animate-pulse">
                            Loading attendance data...
                        </div>
                    ) : records.length === 0 ? (
                        <div className="p-16 text-center flex flex-col items-center text-slate-400 bg-white/5">
                            <div className="p-6 bg-slate-900 rounded-full shadow-sm mb-4 ring-8 ring-white/5">
                                <UserX size={40} className="text-slate-600" />
                            </div>
                            <p className="text-lg font-semibold text-white">No records found today</p>
                            <p className="text-sm mt-1 opacity-70">Wait for employees to check in</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-10 border-y border-white/5">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Check Out</th>
                                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 bg-transparent">
                                {records.map((record) => (
                                    <tr key={record._id} className="group hover:bg-blue-500/5 transition-colors duration-150">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 p-[2px] shadow-sm group-hover:shadow-md transition-shadow">
                                                        <div className="w-full h-full rounded-full bg-slate-900 overflow-hidden text-[10px]">
                                                            {record.employeeId?.photoUrl ? (
                                                                <img
                                                                    src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-500 bg-slate-800">
                                                                    {record.employeeId?.firstName?.[0]}{record.employeeId?.lastName?.[0]}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {record.checkIn?.method === 'face_verification' && (
                                                        <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white p-0.5 rounded-full border border-slate-900" title="Verified by Face">
                                                            <UserCheck size={10} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                                                        {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{record.employeeId?.position} · {record.employeeId?.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {record.checkIn?.time ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-200">
                                                        {format(new Date(record.checkIn.time), 'h:mm a')}
                                                    </span>
                                                    <span className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 bg-white/5 px-2 py-0.5 rounded-full w-fit">
                                                        {record.checkIn.method === 'face_verification' && <UserCheck size={10} />}
                                                        {record.checkIn.method === 'face_verification' ? 'Face Verified' : record.checkIn.method}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-sm text-slate-600">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                            {record.checkOut?.time ? (
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-200">
                                                        {format(new Date(record.checkOut.time), 'h:mm a')}
                                                    </span>
                                                    {record.checkOut.totalHours && (
                                                        <span className="text-xs text-emerald-400 font-medium">
                                                            {record.checkOut.totalHours.toFixed(1)} hrs
                                                        </span>
                                                    )}
                                                </div>
                                            ) : record.checkIn?.time ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-400 animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                    Working
                                                </span>
                                            ) : (
                                                <span className="text-sm text-slate-600">--</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm
                                                ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    record.status === 'late' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                                                        record.status === 'absent' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                            'bg-slate-800 text-slate-400 border-slate-700'
                                                }
                                            `}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${record.status === 'present' ? 'bg-emerald-500' :
                                                    record.status === 'late' ? 'bg-amber-500' :
                                                        record.status === 'absent' ? 'bg-rose-500' :
                                                            'bg-slate-500'
                                                    }`}></span>
                                                {record.status.replace('_', ' ').charAt(0).toUpperCase() + record.status.slice(1)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

