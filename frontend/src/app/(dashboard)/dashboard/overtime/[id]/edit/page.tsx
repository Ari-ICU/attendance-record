'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { OvertimeService } from '@/services/overtime.service';
import { EmployeeService } from '@/services/employee.service';
import { DepartmentService } from '@/services/department.service';

import { useAuth } from '@/contexts/AuthContext';

export default function EditOvertimePage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const isAdminOrManager = Boolean(user && ['admin', 'manager', 'superadmin'].includes(user.role || '') || /lead|manager|head|director|supervisor/i.test(user?.position || ''));
    const id = params.id as string;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [employees, setEmployees] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        employeeName: '',
        department: 'Engineering & IT',
        date: '',
        startTime: '17:30',
        endTime: '20:30',
        hours: 3.0,
        project: '',
        reason: '',
        status: 'pending'
    });

    useEffect(() => {
        if (user && !isAdminOrManager) {
            toast.error('Only team leads and administrators can edit overtime approvals');
            router.push(`/dashboard/overtime/${id}`);
        }
    }, [user, isAdminOrManager, id, router]);

    useEffect(() => {
        const loadInitial = async () => {
            try {
                setFetching(true);
                const [overtimeList, empRes, deptRes] = await Promise.all([
                    OvertimeService.getAll(),
                    EmployeeService.getAllEmployees(),
                    DepartmentService.getAll()
                ]);

                setEmployees(empRes.employees || []);
                setDepartments(deptRes?.data || []);

                const current = overtimeList.find(o => o.id === id || o._id === id) || overtimeList[0];
                if (current) {
                    setFormData({
                        employeeName: current.employeeName || '',
                        department: current.department || 'Engineering & IT',
                        date: current.date ? current.date.substring(0, 10) : '',
                        startTime: current.startTime || '17:30',
                        endTime: current.endTime || '20:30',
                        hours: current.hours || 3.0,
                        project: current.project || '',
                        reason: current.reason || '',
                        status: current.status || 'pending'
                    });
                }
            } catch (err) {
                toast.error('Failed to load overtime submission');
            } finally {
                setFetching(false);
            }
        };
        if (id) loadInitial();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (formData.status) {
                await OvertimeService.updateStatus(id, formData.status);
            }
            toast.success('Overtime submission updated');
            router.push(`/dashboard/overtime/${id}`);
        } catch {
            toast.error('Failed to update overtime submission');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex items-center justify-between bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/overtime/${id}`}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Edit Overtime Submission
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Modify timestamps, calculated extra hours, or status
                        </p>
                    </div>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Staff Member</label>
                        <input
                            type="text"
                            value={formData.employeeName}
                            disabled
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-300 rounded-xl text-sm font-semibold text-slate-700 outline-none cursor-not-allowed"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Department</label>
                        <CustomDropdown
                            value={formData.department}
                            onChange={(val) => setFormData({ ...formData, department: val })}
                            options={departments.length > 0 ? departments.map(d => ({ value: d.name, label: d.name })) : [
                                { value: 'Engineering & IT', label: 'Engineering & IT' },
                                { value: 'Product & Design', label: 'Product & Design' },
                                { value: 'Human Resources', label: 'Human Resources' },
                                { value: 'Operations & Facilities', label: 'Operations & Facilities' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Date</label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Hours</label>
                        <input
                            type="number"
                            step="0.5"
                            value={formData.hours}
                            onChange={(e) => setFormData({ ...formData, hours: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Start Time</label>
                        <input
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">End Time</label>
                        <input
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Project / Task Scope</label>
                        <input
                            type="text"
                            value={formData.project}
                            onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Status</label>
                        <CustomDropdown
                            value={formData.status}
                            onChange={(val) => setFormData({ ...formData, status: val as any })}
                            options={[
                                { value: 'pending', label: 'Pending' },
                                { value: 'approved', label: 'Approved' },
                                { value: 'rejected', label: 'Rejected' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Reason & Deliverables</label>
                        <textarea
                            rows={3}
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href={`/dashboard/overtime/${id}`}
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
                        <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
