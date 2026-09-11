'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { DepartmentService } from '@/services/department.service';
import { EmployeeService } from '@/services/employee.service';
import { Department } from '@/types/department.types';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function EditDepartmentPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        isActive: true,
        headOfDepartment: ''
    });

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [deptRes, empRes] = await Promise.all([
                    DepartmentService.getById(id),
                    EmployeeService.getAllEmployees({ limit: 100 })
                ]);
                const dept = deptRes.data;
                if (dept) {
                    setFormData({
                        name: dept.name,
                        description: dept.description || '',
                        isActive: dept.isActive ?? true,
                        headOfDepartment: (dept.headOfDepartment as any)?._id || ''
                    });
                }
                setEmployees(empRes.employees || []);
            } catch {
                toast.error('Failed to load department details');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setSaving(true);
            await DepartmentService.update(id, {
                name: formData.name,
                description: formData.description,
                isActive: formData.isActive
            });
            toast.success('Department updated successfully');
            router.push(`/dashboard/management/departments/${id}`);
        } catch {
            toast.error('Failed to update department');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
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
                        href={`/dashboard/management/departments/${id}`}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                            Edit Class / Department
                        </h1>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            Update department name, description, and status
                        </p>
                    </div>
                </div>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Department / Class Name *</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Lead Instructor / Head</label>
                        <CustomDropdown
                            value={formData.headOfDepartment}
                            onChange={(val) => setFormData({ ...formData, headOfDepartment: val })}
                            placeholder="Unassigned"
                            options={[
                                { value: '', label: 'Unassigned' },
                                ...employees.map(emp => ({
                                    value: emp._id,
                                    label: `${emp.firstName} ${emp.lastName} (${emp.position || 'Staff'})`
                                }))
                            ]}
                            searchable
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-black">Operational Status</label>
                        <CustomDropdown
                            value={formData.isActive ? 'active' : 'inactive'}
                            onChange={(val) => setFormData({ ...formData, isActive: val === 'active' })}
                            options={[
                                { value: 'active', label: 'Active Unit' },
                                { value: 'inactive', label: 'Archived / Inactive' }
                            ]}
                        />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-bold text-black">Description</label>
                        <textarea
                            rows={4}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full p-4 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium text-black outline-none focus:bg-white focus:border-black transition-colors resize-none"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                    <Link
                        href={`/dashboard/management/departments/${id}`}
                        className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        <span>{saving ? 'Updating...' : 'Save Changes'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
}
