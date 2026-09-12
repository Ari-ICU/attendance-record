'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    Calendar,
    Download,
    Plus,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Eye,
    Edit2,
    Trash2,
    UserCheck,
    MapPin,
    History,
    FileSpreadsheet,
    ArrowLeft
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

function AttendanceRecordsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialStatus = searchParams.get('status') || 'all';
    const viewParam = searchParams.get('view') || '';

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus);

    // Sync with URL query parameter changes
    useEffect(() => {
        const paramStatus = searchParams.get('status');
        if (paramStatus) {
            setStatusFilter(paramStatus);
        } else if (!searchParams.get('status')) {
            setStatusFilter('all');
        }
    }, [searchParams]);

    const fetchRecords = async () => {
        try {
            setLoading(true);
            const res = await AttendanceService.getRecords({ limit: 100 });
            const list = Array.isArray(res) ? res : (Array.isArray(res?.data) ? res.data : (res?.data?.docs || []));
            setRecords(list);
        } catch {
            toast.error('Failed to load attendance records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecords();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this record?')) return;
        try {
            await AttendanceService.deleteRecord(id);
            setRecords(prev => prev.filter(r => r._id !== id));
            toast.success('Attendance record deleted');
        } catch {
            toast.error('Failed to delete record');
        }
    };

    const handleStatusFilterChange = (val: string) => {
        setStatusFilter(val);
        if (val === 'all') {
            if (viewParam) {
                router.push(`/dashboard/attendance/records?view=${viewParam}`);
            } else {
                router.push('/dashboard/attendance/records');
            }
        } else {
            router.push(`/dashboard/attendance/records?status=${val}${viewParam ? `&view=${viewParam}` : ''}`);
        }
    };

    const filtered = records.filter(r => {
        const empName = typeof r.employeeId === 'object' && r.employeeId
            ? `${(r.employeeId as any).firstName || ''} ${(r.employeeId as any).lastName || ''}`.trim()
            : '';
        const dept = typeof r.employeeId === 'object' && r.employeeId
            ? (typeof (r.employeeId as any).department === 'object' ? (r.employeeId as any).department?.name : (r.employeeId as any).department) || ''
            : '';
        const dateStr = r.date || '';

        const matchesSearch =
            empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dept.toLowerCase().includes(searchTerm.toLowerCase()) ||
            dateStr.includes(searchTerm);

        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'present':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                        <CheckCircle2 size={12} /> Present
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
                        <AlertTriangle size={12} /> Late Entry
                    </span>
                );
            case 'absent':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-black">
                        <Clock size={12} /> Absent
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-black border border-slate-200 text-xs font-bold capitalize">
                        {status}
                    </span>
                );
        }
    };

    const isLateView = searchParams.get('status') === 'late';
    const isHistoryView = viewParam === 'history';

    // Page title and subtitle based on active route
    const pageTitle = isLateView
        ? 'Late & Early Leave Logs'
        : isHistoryView
            ? 'Attendance History & Archives'
            : 'Attendance Logs & Records';

    const pageSubtitle = isLateView
        ? 'Review staff arrivals exceeding grace period, late check-ins, and early departures'
        : isHistoryView
            ? 'Historical attendance records, biometric audit trails, and archived timesheets'
            : 'Review biometric scans, check-in timestamps, and manual attendance entries';

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            {isLateView && <AlertTriangle size={22} className="text-amber-600" />}
                            {isHistoryView && <History size={22} className="text-black" />}
                            <span>{pageTitle}</span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold">
                            {filtered.length} {filtered.length === 1 ? 'Record' : 'Records'}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-1">
                        {pageSubtitle}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                    <Link
                        href="/dashboard/attendance/records/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Log Attendance Entry</span>
                    </Link>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/90 p-3.5 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={15} />
                    <input
                        type="text"
                        placeholder="Search employee, department, or date..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-60">
                    <CustomDropdown
                        value={statusFilter}
                        onChange={handleStatusFilterChange}
                        icon={<Filter size={13} />}
                        options={[
                            { value: 'all', label: 'All Statuses' },
                            { value: 'present', label: 'Present Only' },
                            { value: 'late', label: 'Late Only' },
                            { value: 'absent', label: 'Absent Only' }
                        ]}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-5">Staff Member</th>
                                <th className="py-3 px-5">Date</th>
                                <th className="py-3 px-5">Check In</th>
                                <th className="py-3 px-5">Check Out</th>
                                <th className="py-3 px-5">Method</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-black font-bold">
                                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Loading attendance logs...
                                    </td>
                                </tr>
                            ) : filtered.length > 0 ? (
                                filtered.map((record) => {
                                    const emp = typeof record.employeeId === 'object' ? record.employeeId : null;
                                    return (
                                        <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black text-white font-black flex items-center justify-center text-xs">
                                                        {emp?.firstName?.[0] || 'U'}{emp?.lastName?.[0] || ''}
                                                    </div>
                                                    <div>
                                                        <Link href={`/dashboard/attendance/records/${record._id}`} className="font-black text-black block text-sm hover:underline">
                                                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Unassigned'}
                                                        </Link>
                                                        <span className="text-[11px] font-semibold text-slate-700">
                                                            {typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || 'General'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 font-black text-black">
                                                {record.date}
                                            </td>
                                            <td className="py-3.5 px-5 font-mono font-black text-black">
                                                {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="py-3.5 px-5 font-mono font-semibold text-slate-800">
                                                {record.checkOut?.time ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="inline-flex items-center gap-1 font-bold text-black bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                                    <UserCheck size={12} />
                                                    <span>{record.checkIn?.method || 'Manual'}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                {getStatusBadge(record.status)}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <Link
                                                        href={`/dashboard/attendance/records/${record._id}`}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors"
                                                    >
                                                        View
                                                    </Link>
                                                    <Link
                                                        href={`/dashboard/attendance/records/${record._id}/edit`}
                                                        className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                        title="Edit Record"
                                                    >
                                                        <Edit2 size={14} />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(record._id)}
                                                        className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                                        title="Delete Record"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-12 text-center text-slate-700 font-bold">
                                        No {statusFilter !== 'all' ? `${statusFilter} ` : ''}attendance records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default function AttendanceRecordsPage() {
    return (
        <Suspense fallback={
            <div className="p-8 text-center font-bold text-black">
                Loading attendance records...
            </div>
        }>
            <AttendanceRecordsContent />
        </Suspense>
    );
}
