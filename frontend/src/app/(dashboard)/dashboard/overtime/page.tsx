'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Timer,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Search,
    Filter
} from 'lucide-react';
import { OvertimeService } from '@/services/overtime.service';
import { OvertimeItem } from '@/types/overtime.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function OvertimePage() {
    const [overtimes, setOvertimes] = useState<OvertimeItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchOvertimes = async () => {
        try {
            setLoading(true);
            const data = await OvertimeService.getAll();
            setOvertimes(data);
        } catch {
            toast.error('Failed to load overtime records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOvertimes();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this overtime submission?')) return;
        try {
            await OvertimeService.delete(id);
            setOvertimes(prev => prev.filter(o => o.id !== id && o._id !== id));
            toast.success('Overtime record deleted');
        } catch {
            toast.error('Failed to delete overtime record');
        }
    };

    const handleApprove = async (id: string) => {
        try {
            await OvertimeService.updateStatus(id, 'approved');
            setOvertimes(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status: 'approved' } : o));
            toast.success('Overtime approved!');
        } catch {
            toast.error('Failed to approve overtime');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await OvertimeService.updateStatus(id, 'rejected');
            setOvertimes(prev => prev.map(o => (o.id === id || o._id === id) ? { ...o, status: 'rejected' } : o));
            toast.error('Overtime marked as rejected');
        } catch {
            toast.error('Failed to reject overtime');
        }
    };

    const filtered = overtimes.filter(o => {
        const matchesSearch = (o.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (o.project || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold"><CheckCircle2 size={12} /> Approved</span>;
            case 'pending':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold"><Clock size={12} /> Pending</span>;
            case 'rejected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold"><XCircle size={12} /> Rejected</span>;
            default:
                return null;
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>Overtime Submissions</span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold">
                            {overtimes.length} Logs
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black mt-1">
                        Review extra hour submissions, overtime multipliers, and supervisor sign-offs
                    </p>
                </div>

                <Link
                    href="/dashboard/overtime/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Submit Overtime</span>
                </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Pending Approval</span>
                    <h3 className="text-xl sm:text-2xl font-black text-amber-900 mt-1">
                        {overtimes.filter(o => o.status === 'pending').length} Submissions
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Approved Extra Hours</span>
                    <h3 className="text-xl sm:text-2xl font-black text-emerald-800 mt-1">
                        {overtimes.filter(o => o.status === 'approved').reduce((acc, curr) => acc + (curr.hours || 0), 0)} hrs
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Total Requests</span>
                    <h3 className="text-xl sm:text-2xl font-black text-black mt-1">
                        {overtimes.length} Submissions
                    </h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={15} />
                    <input
                        type="text"
                        placeholder="Search employee or project..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-52">
                    <CustomDropdown
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val)}
                        icon={<Filter size={13} />}
                        options={[
                            { value: 'all', label: 'All Submissions' },
                            { value: 'pending', label: 'Pending Only' },
                            { value: 'approved', label: 'Approved Only' },
                            { value: 'rejected', label: 'Rejected Only' }
                        ]}
                    />
                </div>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden space-y-3">
                {filtered.length > 0 ? (
                    filtered.map((req) => (
                        <div key={req.id || req._id} className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <Link href={`/dashboard/overtime/${req.id || req._id}`} className="font-bold text-black text-sm hover:underline">
                                        {req.employeeName}
                                    </Link>
                                    <div className="text-xs font-medium text-slate-700">{req.department}</div>
                                </div>
                                <div>{getStatusBadge(req.status)}</div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-600 block">Project / Scope</span>
                                    <span className="font-bold text-black line-clamp-1">{req.project}</span>
                                </div>
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-600 block">Duration</span>
                                    <span className="font-bold text-black">{req.hours} hrs</span>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-[11px] font-semibold text-slate-600 block">Date & Window</span>
                                    <span className="font-medium text-black">{req.date} ({req.startTime || '17:30'} - {req.endTime || '20:30'})</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100">
                                {req.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => handleApprove(req.id || req._id || '')}
                                            className="px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                        >
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReject(req.id || req._id || '')}
                                            className="px-2.5 py-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                <Link
                                    href={`/dashboard/overtime/${req.id || req._id}`}
                                    className="px-3 py-1.5 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg text-xs transition-colors"
                                >
                                    View
                                </Link>
                                <Link
                                    href={`/dashboard/overtime/${req.id || req._id}/edit`}
                                    className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                    title="Edit Overtime"
                                >
                                    <Edit2 size={14} />
                                </Link>
                                <button
                                    onClick={() => handleDelete(req.id || req._id || '')}
                                    className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                    title="Delete Submission"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-xs font-bold text-black">
                        No overtime submissions found.
                    </div>
                )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-5">Staff Member</th>
                                <th className="py-3 px-5">Project / Scope</th>
                                <th className="py-3 px-5">Date</th>
                                <th className="py-3 px-5">Hours</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {filtered.length > 0 ? (
                                filtered.map((req) => (
                                    <tr key={req.id || req._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div>
                                                <Link href={`/dashboard/overtime/${req.id || req._id}`} className="font-bold text-black block text-sm hover:underline">
                                                    {req.employeeName}
                                                </Link>
                                                <span className="text-[11px] font-medium text-black">{req.department}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className="inline-block font-semibold text-black bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                {req.project}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 font-bold text-black">
                                            {req.date} ({req.startTime || '17:30'} - {req.endTime || '20:30'})
                                        </td>
                                        <td className="py-3.5 px-5 font-bold text-black">
                                            {req.hours} hrs
                                        </td>
                                        <td className="py-3.5 px-5">
                                            {getStatusBadge(req.status)}
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {req.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleApprove(req.id || req._id || '')}
                                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id || req._id || '')}
                                                            className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/dashboard/overtime/${req.id || req._id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/dashboard/overtime/${req.id || req._id}/edit`}
                                                    className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                    title="Edit Overtime"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(req.id || req._id || '')}
                                                    className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete Submission"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-black font-bold">
                                        No overtime submissions found.
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
