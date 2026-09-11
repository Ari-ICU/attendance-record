'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Briefcase,
    Building2,
    Users,
    ShieldCheck,
    Edit2,
    Trash2
} from 'lucide-react';
import { INITIAL_POSITIONS } from '../page';
import toast from 'react-hot-toast';

export default function PositionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const pos = INITIAL_POSITIONS.find(p => p.id === id) || {
        id,
        title: 'System Administrator',
        department: 'Engineering & IT',
        employeeCount: 2,
        description: 'Manages server infrastructure, cloud networks, and biometric IoT endpoints.',
        level: 'Senior'
    };

    const handleDelete = () => {
        if (!confirm('Are you sure you want to delete this position?')) return;
        toast.success('Position deleted');
        router.push('/dashboard/management/positions');
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/management/positions"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>{pos.title}</span>
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            {pos.department} • Tier: {pos.level}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/dashboard/management/positions/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold cursor-pointer"
                    >
                        <Edit2 size={15} />
                        <span>Edit Position</span>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Position"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Position Details Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Department</span>
                        <div className="flex items-center gap-2 mt-2 font-black text-black text-base">
                            <Building2 size={18} />
                            <span>{pos.department}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Seniority Level</span>
                        <div className="flex items-center gap-2 mt-2 font-black text-blue-900 text-base">
                            <ShieldCheck size={18} />
                            <span>{pos.level}</span>
                        </div>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                        <span className="text-xs font-bold text-black uppercase">Current Headcount</span>
                        <div className="flex items-center gap-2 mt-2 font-black text-black text-base">
                            <Users size={18} />
                            <span>{pos.employeeCount} Staff Members</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-200">
                    <h2 className="text-base font-black text-black">Scope of Responsibilities</h2>
                    <p className="text-sm font-medium text-black leading-relaxed">
                        {pos.description || 'Core organizational role responsible for operational directives and attendance logging compliance.'}
                    </p>
                </div>
            </div>
        </div>
    );
}
