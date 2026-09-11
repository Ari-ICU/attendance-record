'use client';

import { useState, useEffect } from 'react';
import {
    Calendar as CalendarIcon,
    Search,
    Download,
    Filter,
    Clock,
    User,
    FileSpreadsheet,
    X,
    Eye,
    MapPin,
    Calendar,
    Activity,
    RotateCcw,
    Check,
    AlertCircle
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
        record.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.employeeId?.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleExport = () => {
        setIsExporting(true);
        try {
            const csvContent = [
                ['Student Name', 'ID', 'Date', 'Check In', 'Check Out', 'Status', 'Location'].join(','),
                ...filteredRecords.map(r => [
                    `"${r.employeeId?.firstName || ''} ${r.employeeId?.lastName || ''}"`,
                    r.employeeId?._id || '',
                    r.date ? new Date(r.date).toLocaleDateString() : '',
                    r.checkIn?.time ? new Date(r.checkIn.time).toLocaleTimeString() : 'N/A',
                    r.checkOut?.time ? new Date(r.checkOut.time).toLocaleTimeString() : 'N/A',
                    r.status,
                    `"${r.checkIn?.location?.address || 'Campus Hub'}"`
                ].join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `attendance_records_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            toast.success('Attendance records exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to export records');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Attendance Records</h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Historical verification logs, date-range filters, and CSV export</p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={handleExport}
                        disabled={isExporting || filteredRecords.length === 0}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs disabled:opacity-50"
                    >
                        <Download size={15} />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={() => fetchData()}
                        className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                        title="Reload records"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Filter Panel Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                        <Filter size={15} className="text-blue-600" />
                        <span className="text-xs font-bold text-slate-900">Filter Criteria</span>
                    </div>
                    {(filters.startDate || filters.endDate || filters.employeeId || filters.status || searchTerm) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                        >
                            <X size={12} />
                            <span>Reset Filters</span>
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search by Name */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">Search Student / Personnel</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Start Date */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">From Date</label>
                        <input
                            type="date"
                            value={filters.startDate}
                            onChange={(e) => handleFilterChange('startDate', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* End Date */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">To Date</label>
                        <input
                            type="date"
                            value={filters.endDate}
                            onChange={(e) => handleFilterChange('endDate', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors capitalize"
                        >
                            <option value="">All Statuses</option>
                            <option value="present">Present</option>
                            <option value="late">Late</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Records Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-sm font-bold text-slate-900">Attendance Log</h2>
                    <span className="text-xs font-semibold text-slate-400">
                        {filteredRecords.length} Results
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-4 sm:px-5">Student / Personnel</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Check In</th>
                                <th className="py-3 px-4">Check Out</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                                        <span className="text-xs font-medium">Loading records...</span>
                                    </td>
                                </tr>
                            ) : filteredRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <p className="text-xs font-medium">No records match your selected criteria</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredRecords.map((record) => {
                                    const isPresent = record.status === 'present';
                                    const isLate = record.status === 'late';
                                    const isAbsent = record.status === 'absent';

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
                                            <td className="py-3 px-4 text-xs font-medium text-slate-700">
                                                {record.date ? new Date(record.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '---'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-slate-700">
                                                {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="py-3 px-4 font-mono text-xs text-slate-700">
                                                {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold capitalize border shadow-2xs ${
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
                                            <td className="py-3 px-4 sm:px-5 text-right">
                                                <button
                                                    onClick={() => {
                                                        setSelectedRecord(record);
                                                        setIsDetailModalOpen(true);
                                                    }}
                                                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Record Detail Modal */}
            <AnimatePresence>
                {isDetailModalOpen && selectedRecord && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-900">Attendance Log Details</h3>
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-sm shrink-0 overflow-hidden">
                                    {selectedRecord.employeeId?.photoUrl ? (
                                        <img
                                            src={getFullImageUrl(selectedRecord.employeeId.photoUrl) || ''}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span>{selectedRecord.employeeId?.firstName?.[0] || 'U'}</span>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-slate-900 text-sm">
                                        {selectedRecord.employeeId?.firstName} {selectedRecord.employeeId?.lastName}
                                    </p>
                                    <p className="text-xs text-slate-500 font-mono">
                                        {selectedRecord.employeeId?.email}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Check In Time</span>
                                    <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">
                                        {selectedRecord.checkIn?.time ? new Date(selectedRecord.checkIn.time).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Check Out Time</span>
                                    <span className="font-bold text-slate-800 font-mono text-sm mt-0.5 block">
                                        {selectedRecord.checkOut?.time ? new Date(selectedRecord.checkOut.time).toLocaleTimeString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1 text-xs">
                                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Verification Mode</span>
                                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-slate-700 font-medium flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                                    <span>Biometric Facial Recognition · On Campus</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => setIsDetailModalOpen(false)}
                                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                                >
                                    Close Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
