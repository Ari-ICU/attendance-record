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
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-pane rounded-[2rem] shadow-2xl overflow-hidden border border-white/10 relative group"
        >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[80px] pointer-events-none" />

            {/* Header: Command Center Style */}
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-slate-950/20 relative z-10">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2.5 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform duration-500">
                            <Clock className="w-6 h-6" />
                        </div>
                        <h2 className="text-2xl font-black text-white italic tracking-tighter uppercase">Mission Control</h2>
                    </div>
                    <div className="flex items-center gap-2 px-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                        </span>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                            Live Telemetry · {new Intl.DateTimeFormat('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date())}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest hidden sm:block">Last Sync</span>
                        <span className="text-xs font-mono font-bold text-slate-400">
                            {lastUpdated.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <button
                        onClick={() => fetchTodaysAttendance(false)}
                        disabled={refreshing || loading}
                        className={`p-3 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all ${refreshing ? 'animate-spin text-emerald-400' : ''}`}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Stats Overview: High-End HUD Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-1 p-1 bg-white/5 relative z-10">
                <div className="bg-slate-900/60 p-6 flex flex-col gap-4 group/stat hover:bg-slate-900 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/10">
                            <UserCheck size={16} />
                        </div>
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">On-Station</p>
                        <p className="text-4xl font-black text-white italic mt-1">{totalPresent}</p>
                    </div>
                </div>

                <div className="bg-slate-900/60 p-6 flex flex-col gap-4 group/stat hover:bg-slate-900 transition-colors">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/10">
                            <UserX size={16} />
                        </div>
                        <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest bg-amber-500/10 px-1.5 py-0.5 rounded">Warning</span>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Late Arrival</p>
                        <p className="text-4xl font-black text-white italic mt-1">{totalLate}</p>
                    </div>
                </div>

                <div className="bg-slate-900/60 p-6 flex flex-col gap-4 group/stat hover:bg-slate-900 transition-colors col-span-2 lg:col-span-1">
                    <div className="flex justify-between items-start">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/10">
                            <Clock size={16} />
                        </div>
                        <div className="flex gap-1">
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse delay-75" />
                        </div>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">In-Session</p>
                        <p className="text-4xl font-black text-white italic mt-1">{currentlyClockedIn}</p>
                    </div>
                </div>
            </div>

            {/* Live Feed Table */}
            <div className="relative z-10 flex-1 flex flex-col min-h-0">
                <div className="overflow-x-auto overflow-y-auto max-h-[500px] scrollbar-hide">
                    {loading && !refreshing ? (
                        <div className="p-20 text-center space-y-4">
                            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Decoding Feed...</p>
                        </div>
                    ) : records.length === 0 ? (
                        <div className="p-24 text-center flex flex-col items-center bg-slate-950/20">
                            <UserX size={48} className="text-slate-800 mb-6" />
                            <h4 className="text-lg font-black text-white uppercase italic">No Signals Detected</h4>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-2">Waiting for station authentication...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 z-20 bg-[#020617] border-b border-white/10">
                                <tr>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Operator Entity</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Inbound</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Outbound</th>
                                    <th className="px-8 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Hash Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {records.map((record) => (
                                    <tr key={record._id} className="group/row hover:bg-emerald-500/[0.02] transition-colors border-l-2 border-transparent hover:border-emerald-500/30">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    <div className="w-11 h-11 rounded-2xl bg-slate-800 p-[1px] overflow-hidden border border-white/5 group-hover/row:border-emerald-500/50 transition-all duration-300">
                                                        {record.employeeId?.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                alt=""
                                                                className="w-full h-full object-cover grayscale group-hover/row:grayscale-0 transition-all duration-500"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-xs font-black text-slate-600 bg-slate-900 uppercase">
                                                                {record.employeeId?.firstName?.[0]}{record.employeeId?.lastName?.[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {record.checkIn?.method === 'face_verification' && (
                                                        <div className="absolute -top-1.5 -right-1.5 p-1 bg-blue-500 rounded-lg shadow-lg border border-white/20">
                                                            <MapPin size={8} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black text-white italic uppercase tracking-tight group-hover/row:text-emerald-400 transition-colors">
                                                        {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                    </div>
                                                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-0.5">{record.employeeId?.position} · {record.employeeId?.department}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {record.checkIn?.time ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-bold text-slate-200">
                                                        {new Date(record.checkIn.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Verified via {record.checkIn.method.replace('_', ' ')}</span>
                                                </div>
                                            ) : <span className="text-slate-700">--:--</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            {record.checkOut?.time ? (
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-mono font-bold text-slate-200">
                                                        {new Date(record.checkOut.time).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                    <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mt-1 italic">{record.checkOut.totalHours?.toFixed(2)}h Logged</span>
                                                </div>
                                            ) : record.checkIn?.time ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic">In Progress</span>
                                                </div>
                                            ) : <span className="text-slate-700">--:--</span>}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`
                                                inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[9px] uppercase tracking-[0.1em]
                                                ${record.status === 'present' ? 'bg-emerald-500/5 text-emerald-400 border-emerald-500/20' :
                                                    record.status === 'late' ? 'bg-amber-500/5 text-amber-400 border-amber-500/20' :
                                                        'bg-rose-500/5 text-rose-400 border-rose-500/20'}
                                            `}>
                                                <div className={`w-1 h-1 rounded-full ${record.status === 'present' ? 'bg-emerald-400 shadow-[0_0_5px_#10b981]' : record.status === 'late' ? 'bg-amber-400 shadow-[0_0_5px_#f59e0b]' : 'bg-rose-400 shadow-[0_0_5px_#f43f5e]'}`} />
                                                {record.status}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Scanning Line Effect */}
            <motion.div
                animate={{ top: ['0%', '100%', '0%'] }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent pointer-events-none z-0"
            />
        </motion.div>
    );
}
