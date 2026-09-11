'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    FileText,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Edit2,
    Trash2,
    Search,
    Filter
} from 'lucide-react';
import { MOCK_LEAVE_REQUESTS, LeaveRequestItem } from '@/mocks/mockData';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function LeavePage() {
    const [leaves, setLeaves] = useState<LeaveRequestItem[]>(MOCK_LEAVE_REQUESTS);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const handleDelete = (id: string) => {
        if (!confirm('Are you sure you want to cancel / delete this leave request?')) return;
        setLeaves(prev => prev.filter(l => l.id !== id));
        toast.success('Leave request deleted');
    };

    const handleApprove = (id: string) => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'approved' } : l));
        toast.success('Leave request approved!');
    };

    const handleReject = (id: string) => {
        setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'rejected' } : l));
        toast.error('Leave request marked as rejected');
    };

    const filtered = leaves.filter(l => {
        const matchesSearch = l.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) || l.type.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
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
                            <span>Time Off & Leave Management</span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold">
                            {leaves.length} Applications
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black mt-1">
                        Track annual leave allowances, medical leaves, and review pending approval queues
                    </p>
                </div>

                <Link
                    href="/dashboard/leave/create"
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
                >
                    <Plus size={16} />
                    <span>Apply for Leave</span>
                </Link>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Pending Review</span>
                    <h3 className="text-2xl font-black text-amber-900 mt-1">
                        {leaves.filter(l => l.status === 'pending').length} Requests
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Approved This Month</span>
                    <h3 className="text-2xl font-black text-emerald-800 mt-1">
                        {leaves.filter(l => l.status === 'approved').length} Requests
                    </h3>
                </div>
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                    <span className="text-xs font-bold text-black uppercase">Total Days Taken</span>
                    <h3 className="text-2xl font-black text-black mt-1">
                        {leaves.reduce((acc, curr) => acc + curr.days, 0)} Days
                    </h3>
                </div>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-slate-200/80 p-3.5 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={15} />
                    <input
                        type="text"
                        placeholder="Search employee or leave type..."
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
                            { value: 'all', label: 'All Requests' },
                            { value: 'pending', label: 'Pending Only' },
                            { value: 'approved', label: 'Approved Only' },
                            { value: 'rejected', label: 'Rejected Only' }
                        ]}
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-5">Staff Member</th>
                                <th className="py-3 px-5">Leave Category</th>
                                <th className="py-3 px-5">Duration</th>
                                <th className="py-3 px-5">Days</th>
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
                                                <Link href={`/dashboard/leave/${req.id}`} className="font-bold text-black block text-sm hover:underline">
                                                    {req.employeeName}
                                                </Link>
                                                <span className="text-[11px] font-medium text-black">{req.department}</span>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className="inline-block font-semibold text-black bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                {req.type}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 font-bold text-black">
                                            {req.startDate} → {req.endDate}
                                        </td>
                                        <td className="py-3.5 px-5 font-bold text-black">
                                            {req.days} {req.days === 1 ? 'Day' : 'Days'}
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
                                                    href={`/dashboard/leave/${req.id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors"
                                                >
                                                    View
                                                </Link>
                                                <Link
                                                    href={`/dashboard/leave/${req.id}/edit`}
                                                    className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                    title="Edit Request"
                                                >
                                                    <Edit2 size={14} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                    title="Delete Request"
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
                                        No leave applications found.
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
