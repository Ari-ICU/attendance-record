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
    ArrowUpRight,
    ArrowDownRight,
    Filter,
    MapPin,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import toast from 'react-hot-toast';

export default function LiveMonitorPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchRecords = async (isManual = false) => {
        try {
            if (isManual) setRefreshing(true);
            const response = await AttendanceService.getRecords({ limit: 50 });
            // Handle different response structures gracefully
            const data = response.data?.docs || response.data || [];
            setRecords(data);
        } catch (error) {
            console.error('Failed to fetch attendance:', error);
            if (isManual) toast.error('Check-point sync failed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRecords();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => fetchRecords(), 30000);
        return () => clearInterval(interval);
    }, []);

    const filteredRecords = records.filter(record =>
        record.employeeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculate daily stats (mocked logic based on sample data)
    const stats = [
        { label: 'Total Present', value: records.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'On Time', value: records.filter(r => r.status === 'present').length, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { label: 'Late Arrival', value: records.filter(r => r.status === 'late').length, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { label: 'Live Active', value: records.filter(r => r.checkIn && !r.checkOut).length, icon: Activity, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight">Live Monitor</h1>
                    <p className="text-slate-400 font-medium tracking-tight flex items-center gap-2">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Real-time attendance stream active
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find employee..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white pl-10 pr-4 py-2.5 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all w-64 text-sm font-medium"
                        />
                    </div>
                    <button
                        onClick={() => fetchRecords(true)}
                        disabled={refreshing}
                        className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all group active:scale-95 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-blue-400' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="glass-pane p-6 rounded-2xl border border-white/5 relative group hover:border-white/10 transition-colors"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">
                                {stat.label}
                            </span>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-white">{stat.value}</span>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 px-2 py-1 rounded-lg bg-emerald-500/10">
                                <ArrowUpRight className="w-3 h-3" />
                                12%
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Main Log Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-pane rounded-3xl border border-white/10 overflow-hidden"
            >
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <Clock className="w-4 h-4 text-blue-400" />
                        </div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">Attendance Activity Log</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Live Stream</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Subject</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check-In</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Check-Out</th>
                                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Log ID</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={5} className="px-6 py-8">
                                            <div className="h-10 bg-white/5 rounded-xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <div className="flex flex-col items-center gap-3 opacity-25">
                                            <Users className="w-12 h-12 text-slate-400" />
                                            <p className="text-sm font-bold uppercase tracking-widest">No activity reported today</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <AnimatePresence mode='popLayout'>
                                    {filteredRecords.map((record) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={record._id}
                                            className="hover:bg-white/[0.02] transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 overflow-hidden">
                                                            {record.employeeId?.photoUrl ? (
                                                                <img
                                                                    src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <UserCircle className="w-full h-full text-slate-600" />
                                                            )}
                                                        </div>
                                                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white leading-tight">{record.employeeId?.fullName || 'Unknown'}</p>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter italic">{record.employeeId?.position || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.checkIn ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-slate-200">
                                                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                                                            <span className="text-xs font-black tracking-tight">{new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                                                            <div className={`px-1.5 py-0.5 rounded-md bg-white/5 border border-white/5 uppercase tracking-widest`}>
                                                                {record.checkIn.method?.replace('_', ' ')}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">Pending</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                {record.checkOut ? (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-slate-200">
                                                            <ArrowDownRight className="w-3.5 h-3.5 text-rose-400" />
                                                            <span className="text-xs font-black tracking-tight">{new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                        </div>
                                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Complete Arrival</p>
                                                    </div>
                                                ) : <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic tracking-tighter">Active Session</span>}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${getStatusStyles(record.status)}`}>
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="text-[10px] font-bold text-slate-600 font-mono tracking-widest">
                                                    #{record._id.slice(-8).toUpperCase()}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
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
