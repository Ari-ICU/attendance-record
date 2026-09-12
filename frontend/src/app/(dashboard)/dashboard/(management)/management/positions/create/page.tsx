'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { PositionService } from '@/services/position.service';

export default function CreatePositionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        department: 'Engineering & IT',
        level: 'Mid-Level',
        description: '',
        responsibilitiesText: '',
        skillsText: '',
        salaryRange: '$1,200 – $2,800 / mo',
        employmentType: 'Full-time / Permanent',
        experienceReq: '2 – 5 Years',
        workPolicy: 'Hybrid (3 days on-site)',
        workingHours: '08:00 – 17:00 (Mon–Fri)'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error('Position title is required');
            return;
        }

        setLoading(true);

        const responsibilities = formData.responsibilitiesText
            .split('\n')
            .map(r => r.trim())
            .filter(Boolean);

        const skills = formData.skillsText
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);

        const payload = {
            title: formData.title.trim(),
            department: formData.department,
            level: formData.level,
            description: formData.description.trim(),
            responsibilities,
            skills,
            salaryRange: formData.salaryRange.trim(),
            employmentType: formData.employmentType.trim(),
            experienceReq: formData.experienceReq.trim(),
            workPolicy: formData.workPolicy.trim(),
            workingHours: formData.workingHours.trim()
        };

        try {
            await PositionService.create(payload);
            toast.success('Position created successfully in backend database!');
            router.push('/dashboard/management/positions');
        } catch {
            toast.error('Failed to create position in backend');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-6 pb-16 font-sans">
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
                            Create New Position & Role Blueprint
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 mt-0.5">
                            Define role title, department, salary band, responsibilities, and required competencies
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-1">
                        <label className="text-xs font-bold text-black">Position Title *</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            placeholder="e.g. Lead Frontend Engineer"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Department</label>
                        <CustomDropdown
                            value={formData.department}
                            onChange={(val) => setFormData({ ...formData, department: val })}
                            options={[
                                { value: 'Engineering & IT', label: 'Engineering & IT' },
                                { value: 'Academic Core', label: 'Academic Core' },
                                { value: 'Human Resources', label: 'Human Resources' },
                                { value: 'Operations & Facilities', label: 'Operations & Facilities' },
                                { value: 'Product & Design', label: 'Product & Design' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Seniority Tier</label>
                        <CustomDropdown
                            value={formData.level}
                            onChange={(val) => setFormData({ ...formData, level: val })}
                            options={[
                                { value: 'Associate', label: 'Associate / Entry' },
                                { value: 'Junior', label: 'Junior' },
                                { value: 'Mid-Level', label: 'Mid-Level' },
                                { value: 'Senior', label: 'Senior' },
                                { value: 'Lead', label: 'Lead / Supervisor' },
                                { value: 'Executive', label: 'Executive / Director' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Salary Band Benchmark</label>
                        <input
                            type="text"
                            value={formData.salaryRange}
                            onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                            placeholder="e.g. $1,500 – $3,000 / mo"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Employment Contract Type</label>
                        <input
                            type="text"
                            value={formData.employmentType}
                            onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                            placeholder="e.g. Full-time / Permanent"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Experience Requirement</label>
                        <input
                            type="text"
                            value={formData.experienceReq}
                            onChange={(e) => setFormData({ ...formData, experienceReq: e.target.value })}
                            placeholder="e.g. 3 – 5 Years"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Workplace Policy</label>
                        <input
                            type="text"
                            value={formData.workPolicy}
                            onChange={(e) => setFormData({ ...formData, workPolicy: e.target.value })}
                            placeholder="e.g. Hybrid (3 days on-site)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Standard Working Hours</label>
                        <input
                            type="text"
                            value={formData.workingHours}
                            onChange={(e) => setFormData({ ...formData, workingHours: e.target.value })}
                            placeholder="e.g. 08:00 – 17:00 (Mon–Fri)"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs font-bold text-black">Role Overview & Executive Summary</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Detail key objectives, team collaboration, and overall mission..."
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs font-bold text-black">
                            Core Responsibilities & Deliverables (One duty per line)
                        </label>
                        <textarea
                            rows={5}
                            value={formData.responsibilitiesText}
                            onChange={(e) => setFormData({ ...formData, responsibilitiesText: e.target.value })}
                            placeholder="Design and implement responsive web features&#10;Optimize frontend load speeds and bundle sizes&#10;Conduct team code reviews and technical mentoring"
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors font-mono text-xs leading-relaxed resize-none"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                        <label className="text-xs font-bold text-black">
                            Required Technical Competencies & Tooling (Comma-separated)
                        </label>
                        <input
                            type="text"
                            value={formData.skillsText}
                            onChange={(e) => setFormData({ ...formData, skillsText: e.target.value })}
                            placeholder="React / Next.js, TypeScript, Tailwind CSS, REST APIs, Git"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors"
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
                        <span>{loading ? 'Creating Position...' : 'Create & Save to Database'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}

