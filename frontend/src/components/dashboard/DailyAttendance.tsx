'use client';

import { useEffect, useState, useCallback } from 'react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import { RefreshCw, Clock, MapPin, UserCheck, UserX, Search, Check, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function DailyAttendance() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'late' | 'absent'>('all');

    const fetchTodaysAttendance = useCallback(async (isAutoRefresh = false) => {
        try {
            if (!isAutoRefresh) setLoading(true);
            else setRefreshing(true);

            const response = await AttendanceService.getRecords({ limit: 50 });
            const data = Array.isArray(response)
                ? response
                : (Array.isArray(response?.data) ? response.data : (response?.data?.docs || []));

            setRecords(data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            if (!isAutoRefresh) toast.error('Failed to load attendance list');
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

    const filteredRecords = records.filter(r => {
        const empName = `${r.employeeId?.firstName || ''} ${r.employeeId?.lastName || ''}`.toLowerCase();
        const dept = (typeof r.employeeId?.department === 'object' ? (r.employeeId.department as any)?.name : r.employeeId?.department || r.employeeId?.position || '').toLowerCase();
        const matchesSearch = empName.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            {/* Header & Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <span>Today&apos;s Attendance</span>
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200">
                            {records.length} Recorded
                        </span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Live workforce check-in telemetry feed · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    {/* Search Input */}
                    <div className="relative flex-1 sm:w-48">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <button
                        onClick={() => fetchTodaysAttendance(false)}
                        disabled={refreshing || loading}
                        className={`p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0 ${refreshing ? 'animate-spin text-blue-600' : ''}`}
                        title="Refresh list"
                    >
                        <RefreshCw size={14} />
                    </button>
                </div>
            </div>

            {/* Quick Status Filter Tabs */}
            <div className="px-4 sm:px-5 py-2.5 bg-slate-50/60 border-b border-slate-100 flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
                {[
                    { id: 'all', label: 'All' },
                    { id: 'present', label: 'Present' },
                    { id: 'late', label: 'Late' },
                    { id: 'absent', label: 'Absent' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusFilter(tab.id as any)}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize ${
                            statusFilter === tab.id
                                ? 'bg-white text-blue-600 shadow-xs border border-slate-200/80 font-bold'
                                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table Area */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <th className="py-3 px-4 sm:px-5">Employee / Staff</th>
                            <th className="py-3 px-4">Department & Role</th>
                            <th className="py-3 px-4">Check-in Time</th>
                            <th className="py-3 px-4">Verification</th>
                            <th className="py-3 px-4 sm:px-5 text-right">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                                    <span className="text-xs font-medium">Loading today&apos;s attendance...</span>
                                </td>
                            </tr>
                        ) : filteredRecords.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-400">
                                    <AlertCircle size={24} className="mx-auto mb-1.5 opacity-40 text-slate-400" />
                                    <p className="text-xs font-medium">No attendance records match your filter</p>
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record) => {
                                const isPresent = record.status === 'present';
                                const isLate = record.status === 'late';
                                const isAbsent = record.status === 'absent';

                                return (
                                    <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                                        {/* Staff / Employee Info */}
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
                                                        <span>{record.employeeId?.firstName?.[0] || 'E'}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                                        {record.employeeId?.firstName} {record.employeeId?.lastName}
                                                    </p>
                                                    <p className="text-[11px] text-slate-400 font-mono truncate">
                                                        {record.employeeId?.email || record.employeeId?._id?.substring(0, 8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Class / Department */}
                                        <td className="py-3 px-4 text-xs font-medium text-slate-600">
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                                                {typeof record.employeeId?.department === 'object' ? (record.employeeId.department as any)?.name : record.employeeId?.department || record.employeeId?.position || 'Web 01'}
                                            </span>
                                        </td>

                                        {/* Time */}
                                        <td className="py-3 px-4 font-mono text-xs text-slate-700">
                                            {record.checkIn?.time ? (
                                                <span className="font-semibold">
                                                    {format(new Date(record.checkIn.time), 'hh:mm a')}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400">--:--</span>
                                            )}
                                        </td>

                                        {/* Verification Mode */}
                                        <td className="py-3 px-4 text-xs text-slate-500">
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                <span>Face Bio</span>
                                            </span>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3 px-4 sm:px-5 text-right">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold capitalize border shadow-2xs ${
                                                isPresent
                                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                    : isLate
                                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border-rose-200'
                                            }`}>
                                                {isPresent && <Check size={13} strokeWidth={3} className="text-emerald-600" />}
                                                {isLate && <Clock size={13} className="text-amber-600" />}
                                                {isAbsent && <X size={13} strokeWidth={3} className="text-rose-600" />}
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
    );
}
