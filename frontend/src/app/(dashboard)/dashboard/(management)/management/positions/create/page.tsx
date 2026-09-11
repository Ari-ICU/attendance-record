'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePositionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: 'Engineering & IT',
        level: 'Mid-Level',
        description: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Position title is required');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            toast.success('Position created successfully!');
            router.push('/dashboard/management/positions');
        }, 300);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/management/positions"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Create New Position
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Define a title, seniority tier, and responsibilities
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Position Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Lead Curriculum Designer"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Department</label>
                        <select
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        >
                            <option value="Engineering & IT">Engineering & IT</option>
                            <option value="Academic Core">Academic Core</option>
                            <option value="Human Resources">Human Resources</option>
                            <option value="Operations & Facilities">Operations & Facilities</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Seniority Tier</label>
                        <select
                            value={formData.level}
                            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        >
                            <option value="Associate">Associate / Entry</option>
                            <option value="Mid-Level">Mid-Level</option>
                            <option value="Senior">Senior</option>
                            <option value="Lead">Lead / Supervisor</option>
                            <option value="Executive">Executive / Director</option>
                        </select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Role Scope & Responsibilities</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detail key responsibilities and expectations..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/management/positions"
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        <span>{loading ? 'Creating...' : 'Save Position'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
