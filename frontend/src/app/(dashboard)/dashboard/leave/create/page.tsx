'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, FileText, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateLeavePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        employeeName: 'Thoeurn Ratha',
        department: 'Engineering & IT',
        type: 'Annual Leave',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
        reason: '',
        contactDuringLeave: '+855 12 345 678'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.reason.trim()) {
            toast.error('Please specify a reason for the leave');
            return;
        }

        setLoading(true);
        setTimeout(() => {
            toast.success('Leave application submitted successfully!');
            router.push('/dashboard/leave');
        }, 300);
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/leave"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Apply for Leave / Time Off
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Submit a leave request for departmental approval
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Staff Member</label>
                        <input
                            type="text"
                            value={formData.employeeName}
                            onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Leave Category</label>
                        <select
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        >
                            <option value="Annual Leave">Annual Leave (18 Days Available)</option>
                            <option value="Sick Leave">Sick / Medical Leave</option>
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Maternity / Paternity">Maternity / Paternity</option>
                            <option value="Emergency">Emergency Leave</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Start Date</label>
                        <input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">End Date</label>
                        <input
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Reason for Leave *</label>
                        <textarea
                            rows={4}
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Provide details regarding your planned absence and handoff plan..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href="/dashboard/leave"
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
                        <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
