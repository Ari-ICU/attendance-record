'use client';

import { useState } from 'react';
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
import toast from 'react-hot-toast';

export interface OvertimeItem {
    id: string;
    employeeName: string;
    department: string;
    date: string;
    startTime: string;
    endTime: string;
    hours: number;
    project: string;
    reason: string;
    status: 'approved' | 'pending' | 'rejected';
}

export const INITIAL_OVERTIME: OvertimeItem[] = [
    { id: 'ot_001', employeeName: 'Thoeurn Ratha', department: 'Engineering & IT', date: '2026-09-10', startTime: '17:30', endTime: '20:30', hours: 3.0, project: 'Biometric Gateway Upgrade', reason: 'Campus IoT sensor firmware sync and database patch.', status: 'approved' },
    { id: 'ot_002', employeeName: 'Sarah Jenkins', department: 'Academic Core', date: '2026-09-09', startTime: '17:00', endTime: '19:00', hours: 2.0, project: 'Mid-term Exam Prep', reason: 'Curriculum exam grading and student submission review.', status: 'pending' },
    { id: 'ot_003', employeeName: 'David Miller', department: 'Operations & Facilities', date: '2026-09-08', startTime: '18:00', endTime: '21:30', hours: 3.5, project: 'Campus Security Audit', reason: 'Night gate check-in turnstile diagnostic.', status: 'approved' },
];

export default function OvertimePage() {
    const [overtimes, setOvertimes] = useState<OvertimeItem[]>(INITIAL_OVERTIME);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to delete this overtime submission?')) return;
        setOvertimes(prev => prev.filter(o => o.id !== id));
        toast.success('Overtime record deleted');
    };

    const handleApprove = (id: string) => {
        setOvertimes(prev => prev.map(o => o.id === id ? { ...o, status: 'approved' } : o));
        toast.success('Overtime approved!');
    };

    const handleReject = (id: string) => {
        setOvertimes(prev => prev.map(o => o.id === id ? { ...o, status: 'rejected' } : o));
        toast.error('Overtime marked as rejected');
    };

    const filtered = overtimes.filter(o => {
        const matchesSearch = o.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || o.project.toLowerCase().includes(searchTerm.toLowerCase());
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Pending Approval</span>
                    <h3 className="text-2xl font-black text-amber-900 mt-1">
                        {overtimes.filter(o => o.status === 'pending').length} Submissions
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Approved Extra Hours</span>
                    <h3 className="text-2xl font-black text-emerald-800 mt-1">
                        {overtimes.filter(o => o.status === 'approved').reduce((acc, curr) => acc + curr.hours, 0)} hrs
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Total Requests</span>
                    <h3 className="text-2xl font-black text-black mt-1">
                        {overtimes.length} Submissions
                    </h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
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

                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-black flex items-center gap-1"><Filter size={13} /> Filter:</span>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                    >
                        <option value="all">All Submissions</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved Only</option>
                        <option value="rejected">Rejected Only</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
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
                                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div>
                                                <Link href={`/dashboard/overtime/${req.id}`} className="font-bold text-black block text-sm hover:underline">
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
                                            {req.date} ({req.startTime} - {req.endTime})
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
                                                            onClick={() => handleApprove(req.id)}
                                                            className="px-2.5 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 font-bold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(req.id)}
                                                            className="px-2.5 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 font-bold rounded-lg transition-colors cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    href={`/dashboard/overtime/${req.id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/dashboard/overtime/${req.id}/edit`}
                                                    className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                    title="Edit Overtime"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
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
