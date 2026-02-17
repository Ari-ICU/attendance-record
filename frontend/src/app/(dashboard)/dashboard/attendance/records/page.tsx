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
    MoreHorizontal,
    Eye,
    MapPin,
    Monitor,
    Globe,
    Cpu,
    Calendar,
    Activity,
    ShieldAlert
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
    const [currentTime, setCurrentTime] = useState(new Date());
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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
                new Date(r.date).toLocaleDateString('en-US', { timeZone: 'Asia/Phnom_Penh' }),
                r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : '---',
                r.checkIn?.method?.replace('_', ' ') || '---',
                r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : '---',
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
                    <div className="flex items-center gap-3">
                        <p className="text-slate-400 font-medium tracking-tight">Review historical biometric logs and performance records</p>
                        <span className="text-slate-700 font-black">•</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-lg border border-blue-500/20">
                            <Clock className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 tracking-widest uppercase">
                                System Time: {currentTime.toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                    timeZone: 'Asia/Phnom_Penh'
                                })}
                            </span>
                        </div>
                    </div>
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
                    <table className="w-full min-w-[1000px] lg:min-w-full">
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
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    timeZone: 'Asia/Phnom_Penh'
                                                })}
                                            </p>
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Day Log</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                                    <span className="text-xs font-black text-slate-200">
                                                        {record.checkIn ? new Date(record.checkIn.time).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            timeZone: 'Asia/Phnom_Penh'
                                                        }) : '---'}
                                                    </span>
                                                    {record.checkIn?.location && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${record.checkIn.location.latitude},${record.checkIn.location.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 bg-blue-500/10 rounded-md border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all scale-75"
                                                            title="View Check-in Location"
                                                        >
                                                            <MapPin size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" />
                                                    <span className="text-xs font-black text-slate-200">
                                                        {record.checkOut ? new Date(record.checkOut.time).toLocaleTimeString('en-US', {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                            timeZone: 'Asia/Phnom_Penh'
                                                        }) : '---'}
                                                    </span>
                                                    {record.checkOut?.location && (
                                                        <a
                                                            href={`https://www.google.com/maps?q=${record.checkOut.location.latitude},${record.checkOut.location.longitude}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-1 bg-rose-500/10 rounded-md border border-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all scale-75"
                                                            title="View Check-out Location"
                                                        >
                                                            <MapPin size={10} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${record.totalHours ? 'bg-slate-800' : 'bg-blue-500/10 border border-blue-500/20'}`}>
                                                    <Clock className={`w-4 h-4 ${record.totalHours ? 'text-slate-600' : 'text-blue-400 animate-pulse'}`} />
                                                </div>
                                                <span className={`text-xs font-black ${record.totalHours ? 'text-white' : 'text-blue-400'}`}>
                                                    {record.totalHours ? `${record.totalHours.toFixed(1)}h` : 'ACTIVE'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyles(record.status)}`}>
                                                    {record.status}
                                                </span>
                                                {record.checkIn?.method === 'face_verification' && !record.checkIn?.location && (
                                                    <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-tighter mt-1 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                                                        <ShieldAlert size={8} />
                                                        Low Integrity
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(record);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="p-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all border border-blue-500/20 shadow-lg shadow-blue-500/5 group/btn"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20 shadow-lg shadow-rose-500/5 group/btn"
                                                    title="Delete Record"
                                                >
                                                    <X className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
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
            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedRecord && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-white/10 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative"
                        >
                            {/* Modal Header */}
                            <div className="bg-white/5 border-b border-white/5 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                        <Activity className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-white italic tracking-tight">Record Telemetry</h3>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Log ID: {selectedRecord._id.toUpperCase()}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-2.5 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                {/* Personnel Overview */}
                                <div className="flex items-center gap-6 mb-8 p-4 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden shadow-2xl">
                                        {selectedRecord.employeeId?.photoUrl ? (
                                            <img
                                                src={getFullImageUrl(selectedRecord.employeeId.photoUrl) || ''}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-700">
                                                <User className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-white">{selectedRecord.employeeId?.fullName}</h4>
                                        <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">{selectedRecord.employeeId?.position} • {selectedRecord.employeeId?.department}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyles(selectedRecord.status)}`}>
                                                {selectedRecord.status}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                                ID: {selectedRecord.employeeId?._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Entry Log */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-4 bg-emerald-500 rounded-full" />
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entry Vector (Check-In)</h5>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">Timestamp</span>
                                                <span className="font-black text-white italic">
                                                    {selectedRecord.checkIn?.time ? new Date(selectedRecord.checkIn.time).toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : 'Pending'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">Protocol</span>
                                                <span className="font-black text-blue-400 uppercase tracking-wider">{selectedRecord.checkIn?.method || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">GPS Node</span>
                                                {selectedRecord.checkIn?.location ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${selectedRecord.checkIn.location.latitude},${selectedRecord.checkIn.location.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-black text-blue-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <MapPin size={10} />
                                                        {selectedRecord.checkIn.location.latitude.toFixed(4)}, {selectedRecord.checkIn.location.longitude.toFixed(4)}
                                                    </a>
                                                ) : (
                                                    <span className="font-black text-slate-500 italic">No Location Data</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">IP Source</span>
                                                <span className="font-black text-slate-300">{selectedRecord.checkIn?.ipAddress || 'Internal Network'}</span>
                                            </div>
                                            {selectedRecord.checkIn?.method === 'face_verification' && !selectedRecord.checkIn?.location && (
                                                <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3">
                                                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                                                    <div className="flex flex-col">
                                                        <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">Integrity Violation</span>
                                                        <span className="text-[8px] font-bold text-rose-400/60 uppercase">Biometric scan performed without GPS anchor. Potential spoofing or bypass detected.</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Exit Log */}
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-1.5 h-4 bg-rose-500 rounded-full" />
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Exit Vector (Check-Out)</h5>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 rounded-2xl p-4 space-y-3">
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">Timestamp</span>
                                                <span className="font-black text-white italic">
                                                    {selectedRecord.checkOut?.time ? new Date(selectedRecord.checkOut.time).toLocaleString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : 'Active Session'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">Work Hours</span>
                                                <span className="font-black text-emerald-400 uppercase tracking-wider">{selectedRecord.totalHours ? `${selectedRecord.totalHours.toFixed(1)} Hours` : 'In Progress'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">GPS Exit Node</span>
                                                {selectedRecord.checkOut?.location ? (
                                                    <a
                                                        href={`https://www.google.com/maps?q=${selectedRecord.checkOut.location.latitude},${selectedRecord.checkOut.location.longitude}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="font-black text-rose-400 hover:underline flex items-center gap-1"
                                                    >
                                                        <MapPin size={10} />
                                                        {selectedRecord.checkOut.location.latitude.toFixed(4)}, {selectedRecord.checkOut.location.longitude.toFixed(4)}
                                                    </a>
                                                ) : (
                                                    <span className="font-black text-slate-500 italic">No Location Data</span>
                                                )}
                                            </div>
                                            <div className="flex justify-between items-center text-[10px]">
                                                <span className="font-bold text-slate-500 uppercase">Exit Device</span>
                                                <span className="font-black text-slate-300">Biometric Terminal</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-white/5 border-t border-white/5 p-6 flex items-center justify-between">
                                <div className="flex gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Network Authority</span>
                                        <span className="text-[9px] font-bold text-slate-400">Authenticated Biometric Access</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="px-8 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
