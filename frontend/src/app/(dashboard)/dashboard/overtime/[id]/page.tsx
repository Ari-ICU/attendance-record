'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Edit2,
    Trash2,
    Timer,
    Briefcase
} from 'lucide-react';
import { MOCK_OVERTIME, OvertimeItem } from '@/mocks/mockData';
import toast from 'react-hot-toast';

export default function OvertimeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [req, setReq] = useState<OvertimeItem>(
        MOCK_OVERTIME.find(o => o.id === id) || MOCK_OVERTIME[0]
    );

    const handleApprove = () => {
        setReq(prev => ({ ...prev, status: 'approved' }));
        toast.success('Overtime approved!');
    };

    const handleReject = () => {
        setReq(prev => ({ ...prev, status: 'rejected' }));
        toast.error('Overtime marked as rejected');
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this overtime submission?')) return;
        toast.success('Overtime submission deleted');
        router.push('/dashboard/overtime');
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/overtime"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                Overtime Submission Detail
                            </h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                                req.status === 'approved'
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                    : req.status === 'pending'
                                    ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                                {req.status}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            {req.employeeName} • {req.department}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    {req.status === 'pending' && (
                        <>
                            <button
                                onClick={handleApprove}
                                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                            >
                                Approve
                            </button>
                            <button
                                onClick={handleReject}
                                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs cursor-pointer"
                            >
                                Reject
                            </button>
                        </>
                    )}
                    <Link
                        href={`/dashboard/overtime/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold cursor-pointer"
                    >
                        <Edit2 size={15} />
                        <span>Edit</span>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Submission"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Overtime Details Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Project Scope</span>
                        <h3 className="text-base font-black text-black mt-1">{req.project}</h3>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Date & Window</span>
                        <h3 className="text-base font-black text-black mt-1">{req.date} ({req.startTime} - {req.endTime})</h3>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Logged Hours</span>
                        <h3 className="text-base font-black text-black mt-1">{req.hours} Hours</h3>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200">
                    <h2 className="text-base font-black text-black">Reason & Technical Work Log</h2>
                    <p className="text-sm font-medium text-black leading-relaxed">
                        {req.reason}
                    </p>
                </div>
            </div>
        </div>
    );
}
