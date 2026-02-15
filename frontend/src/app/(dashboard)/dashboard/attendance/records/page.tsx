'use client';

import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    Download,
    Filter,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    ArrowUpDown,
    FileSpreadsheet,
    X,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { getFullImageUrl } from '@/utils/url.utils';
import toast from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';

export default function AttendanceRecordsPage() {
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        employeeId: '',
        status: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [recordsRes, employeesRes] = await Promise.all([
                AttendanceService.getRecords(filters),
                EmployeeService.getAllEmployees({ limit: 1000 })
            ]);

            setRecords(recordsRes.data?.docs || recordsRes.data || []);
            setEmployees(employeesRes.employees || []);
        } catch (error) {
            console.error('Failed to fetch data:', error);
            toast.error('Failed to sync records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters]);

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            startDate: '',
            endDate: '',
            employeeId: '',
            status: ''
        });
        setSearchTerm('');
    };

    const filteredRecords = records.filter(record =>
        record.employeeId?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        setIsExporting(true);
        try {
            const headers = ['Personnel', 'Position', 'Dept', 'Date', 'Check-In', 'CI Method', 'Check-Out', 'CO Method', 'Total Hours', 'Status'];

            const formatCSVRow = (arr: (string | number)[]) => {
                return arr.map(val => {
                    const s = String(val ?? '');
                    return s.includes(',') || s.includes('"') || s.includes('\n')
                        ? `"${s.replace(/"/g, '""')}"`
                        : s;
                }).join(',');
            };

            const rows = filteredRecords.map(r => [
                r.employeeId?.fullName || 'N/A',
                r.employeeId?.position || 'N/A',
                r.employeeId?.department || 'N/A',
                new Date(r.date).toLocaleDateString(),
                r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : '---',
                r.checkIn?.method?.replace('_', ' ') || '---',
                r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : '---',
                r.checkOut?.method?.replace('_', ' ') || '---',
                r.totalHours ? r.totalHours.toFixed(2) : '0.00',
                r.status?.toUpperCase() || 'PRESENT'
            ]);

            const csvContent = [headers.join(','), ...rows.map(row => formatCSVRow(row))].join("\n");
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Attendance report exported');
        } catch (error) {
            toast.error('Failed to export report');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDeleteRecord = async (id: string) => {
        if (!confirm('Are you sure you want to delete this attendance record? This action cannot be undone.')) return;

        try {
            await AttendanceService.deleteRecord(id);
            setRecords(prev => prev.filter(r => r._id !== id));
            toast.success('Record deleted successfully');
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete record');
        }
    };

    return (
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Attendance Vault</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Review historical biometric logs and performance records</p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm tracking-widest hover:bg-blue-500 transition-all shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        EXPORT REPORT
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-pane p-6 rounded-3xl border border-white/10 bg-white/[0.02]"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Global Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="text"
                                placeholder="Search subject..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 pl-10 pr-4 text-xs font-bold text-white outline-none focus:border-blue-500/50 transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Date Range</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={filters.startDate}
                                    onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 px-4 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-all uppercase"
                                />
                            </div>
                            <span className="text-slate-600 font-bold">/</span>
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={filters.endDate}
                                    onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 px-4 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-all uppercase"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Member Filter</label>
                        <select
                            value={filters.employeeId}
                            onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 px-4 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none uppercase"
                        >
                            <option value="">All Personnel</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Log Type</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full bg-slate-950/50 border border-white/5 rounded-xl py-2.5 px-4 text-[10px] font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none uppercase"
                            >
                                <option value="">All Status</option>
                                <option value="present">On Time</option>
                                <option value="late">Late Arrival</option>
                                <option value="absent">Absent</option>
                                <option value="on_leave">Leave</option>
                            </select>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all"
                            title="Reset Filters"
                            color='white'
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Records Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-pane rounded-3xl border border-white/10 overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/5 border-b border-white/5">
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Subject Information</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Shift Date</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entry / Exit</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Duration</th>
                                <th className="px-6 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Compliance</th>
                                <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-6 py-8">
                                            <div className="h-12 bg-white/5 rounded-2xl w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 opacity-30">
                                            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center">
                                                <FileSpreadsheet className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-widest">No matching logs found</p>
                                                <p className="text-xs font-bold text-slate-500 mt-1 uppercase">Try adjusting your spectral filters</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
                                                    {record.employeeId?.photoUrl ? (
                                                        <img
                                                            src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                            alt=""
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                            <User className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white mb-0.5">{record.employeeId?.fullName || 'Personnel'}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">#{record.employeeId?._id.slice(-8).toUpperCase()}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs font-black text-slate-300">
                                                {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Day Log</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-xs font-black text-slate-200">
                                                        {record.checkIn ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                    <span className="text-xs font-black text-slate-200">
                                                        {record.checkOut ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '---'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-slate-600" />
                                                <span className="text-xs font-black text-white">
                                                    {record.checkOut?.totalHours ? `${record.checkOut.totalHours.toFixed(1)}h` : 'Active'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(record.status)}`}>
                                                {record.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                    className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                                                    title="Delete Record"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Showing {filteredRecords.length} records</p>
                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg bg-white/5 text-slate-600 hover:text-white disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-2 rounded-lg bg-blue-600 text-white font-bold text-xs px-4 shadow-lg shadow-blue-500/20">1</button>
                        <button className="p-2 rounded-lg bg-white/5 text-slate-600 hover:text-white disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

const RefreshCw = ({ className }: { className?: string }) => (
    <motion.svg
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={className}
        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    >
        <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
        <path d="M21 3v5h-5" />
    </motion.svg>
);

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
