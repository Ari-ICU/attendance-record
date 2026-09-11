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
    ShieldAlert,
    RotateCcw
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
    const [currentTime, setCurrentTime] = useState<Date | null>(null);
    const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        setCurrentTime(new Date());
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
        <div className="space-y-6 pb-12">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Attendance Records</h1>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1 text-xs text-slate-400">
                        <span>Review historical biometric logs and performance records</span>
                        {currentTime && (
                            <>
                                <span className="text-slate-600 hidden sm:inline">•</span>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg border border-slate-700/60 text-slate-300 font-mono text-[11px]">
                                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                                    <span>
                                        {currentTime.toLocaleTimeString('en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                            timeZone: 'Asia/Phnom_Penh'
                                        })}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-500 transition-colors shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        {isExporting ? <RotateCcw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Filter Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Date Range</label>
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                            />
                            <span className="text-slate-600 text-xs">-</span>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Employee</label>
                        <select
                            value={filters.employeeId}
                            onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                        >
                            <option value="">All Personnel</option>
                            {employees.map(emp => (
                                <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-end gap-2">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Status</label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                            >
                                <option value="">All Statuses</option>
                                <option value="present">Present (On Time)</option>
                                <option value="late">Late Arrival</option>
                                <option value="absent">Absent</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </div>
                        <button
                            onClick={clearFilters}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-colors"
                            title="Reset Filters"
                        >
                            <RotateCcw className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Records Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[850px] text-left">
                        <thead>
                            <tr className="bg-slate-950/60 border-b border-slate-800">
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Check In / Out</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Time</th>
                                <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-5 py-4">
                                            <div className="h-10 bg-slate-800 rounded-lg w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-slate-500">
                                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center">
                                                <FileSpreadsheet className="w-6 h-6 text-slate-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-300">No matching attendance records</p>
                                                <p className="text-xs text-slate-500 mt-0.5">Try adjusting your search criteria or date filter</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => (
                                    <tr key={record._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-semibold text-xs">
                                                    {record.employeeId?.photoUrl ? (
                                                        <img
                                                            src={getFullImageUrl(record.employeeId.photoUrl) || ''}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{record.employeeId?.firstName?.charAt(0) || 'U'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-semibold text-white">{record.employeeId?.fullName || 'Personnel'}</p>
                                                    <p className="text-[11px] text-slate-400">{record.employeeId?.position || 'Staff'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <p className="text-xs sm:text-sm font-medium text-slate-200">
                                                {new Date(record.date).toLocaleDateString('en-US', {
                                                    day: '2-digit',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    timeZone: 'Asia/Phnom_Penh'
                                                })}
                                            </p>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-1 text-xs font-mono">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                                    <span className="text-slate-300">
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
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="View Check-in Location"
                                                        >
                                                            <MapPin size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0" />
                                                    <span className="text-slate-400">
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
                                                            className="text-blue-400 hover:text-blue-300"
                                                            title="View Check-out Location"
                                                        >
                                                            <MapPin size={12} />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-xs font-semibold ${record.totalHours ? 'text-slate-200' : 'text-blue-400'}`}>
                                                {record.totalHours ? `${record.totalHours.toFixed(1)} hrs` : 'In Progress'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex flex-col gap-1">
                                                <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize border ${getStatusStyles(record.status)}`}>
                                                    {record.status?.replace('_', ' ')}
                                                </span>
                                                {record.checkIn?.method === 'face_verification' && !record.checkIn?.location && (
                                                    <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400">
                                                        <ShieldAlert size={10} />
                                                        No GPS
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(record);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteRecord(record._id)}
                                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
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

                {/* Footer info */}
                <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <span>Showing {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white font-medium text-xs">1</span>
                        <button className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-40">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-xl"
                        >
                            {/* Modal Header */}
                            <div className="bg-slate-950/60 border-b border-slate-800 p-5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <Activity className="w-4 h-4 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-white">Record Details</h3>
                                        <p className="text-xs text-slate-400 font-mono">ID: {selectedRecord._id}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                                {/* Personnel Overview */}
                                <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
                                    <div className="w-14 h-14 rounded-xl bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-bold text-lg">
                                        {selectedRecord.employeeId?.photoUrl ? (
                                            <img
                                                src={getFullImageUrl(selectedRecord.employeeId.photoUrl) || ''}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <User className="w-6 h-6" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-white">{selectedRecord.employeeId?.fullName}</h4>
                                        <p className="text-xs text-slate-400">{selectedRecord.employeeId?.position} • {selectedRecord.employeeId?.department}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-semibold capitalize border ${getStatusStyles(selectedRecord.status)}`}>
                                                {selectedRecord.status?.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {/* Entry Log */}
                                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2.5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                            <h5 className="text-xs font-semibold text-slate-300">Check-In Details</h5>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Time</span>
                                            <span className="font-mono text-slate-200">
                                                {selectedRecord.checkIn?.time ? new Date(selectedRecord.checkIn.time).toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Method</span>
                                            <span className="text-slate-200 capitalize">{selectedRecord.checkIn?.method?.replace('_', ' ') || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Location</span>
                                            {selectedRecord.checkIn?.location ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${selectedRecord.checkIn.location.latitude},${selectedRecord.checkIn.location.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
                                                >
                                                    <MapPin size={11} />
                                                    GPS Verified
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 italic">No GPS Data</span>
                                            )}
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">IP Address</span>
                                            <span className="font-mono text-slate-300">{selectedRecord.checkIn?.ipAddress || 'Internal'}</span>
                                        </div>
                                    </div>

                                    {/* Exit Log */}
                                    <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-2.5">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="w-2 h-2 rounded-full bg-blue-400" />
                                            <h5 className="text-xs font-semibold text-slate-300">Check-Out Details</h5>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Time</span>
                                            <span className="font-mono text-slate-200">
                                                {selectedRecord.checkOut?.time ? new Date(selectedRecord.checkOut.time).toLocaleTimeString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : 'Active Session'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Work Duration</span>
                                            <span className="font-semibold text-emerald-400">
                                                {selectedRecord.totalHours ? `${selectedRecord.totalHours.toFixed(1)} hrs` : 'In Progress'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xs">
                                            <span className="text-slate-500">Location</span>
                                            {selectedRecord.checkOut?.location ? (
                                                <a
                                                    href={`https://www.google.com/maps?q=${selectedRecord.checkOut.location.latitude},${selectedRecord.checkOut.location.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-400 hover:underline flex items-center gap-1 font-mono"
                                                >
                                                    <MapPin size={11} />
                                                    GPS Verified
                                                </a>
                                            ) : (
                                                <span className="text-slate-500 italic">No GPS Data</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="bg-slate-950/60 border-t border-slate-800 p-4 flex justify-end">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
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
