'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    Settings2,
    Trash2,
    Building2,
    X,
    RotateCcw,
    Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DepartmentService } from '@/services/department.service';
import { EmployeeService } from '@/services/employee.service';
import { Department } from '@/types/department.types';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { getFullImageUrl } from '@/utils/url.utils';

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        head: ''
    });
    const [isEditMode, setIsEditMode] = useState(false);
    const [activeDepartmentId, setActiveDepartmentId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, empRes] = await Promise.all([
                DepartmentService.getAll(),
                EmployeeService.getAllEmployees({ limit: 1000 })
            ]);
            setDepartments(deptRes.data || []);
            setEmployees(empRes.employees || []);
        } catch (error) {
            toast.error('Failed to load classes / departments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && activeDepartmentId) {
                await DepartmentService.update(activeDepartmentId, formData);
                toast.success('Class updated successfully');
            } else {
                await DepartmentService.create(formData);
                toast.success('Class created successfully');
            }
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', head: '' });
            setIsEditMode(false);
            setActiveDepartmentId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const openEditModal = (dept: Department) => {
        setFormData({
            name: dept.name,
            description: dept.description || '',
            head: dept.head?._id || ''
        });
        setIsEditMode(true);
        setActiveDepartmentId(dept._id);
        setIsCreateModalOpen(true);
    };

    const openCreateModal = () => {
        setFormData({ name: '', description: '', head: '' });
        setIsEditMode(false);
        setActiveDepartmentId(null);
        setIsCreateModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this class/department?')) return;
        try {
            await DepartmentService.delete(id);
            toast.success('Class / Department deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete');
        }
    };

    const filteredDepartments = departments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <span>Classes & Departments</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold border border-blue-200">
                            {departments.length} Units
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Configure classes, course tracks, instructors, and student headcounts.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-semibold active:scale-95"
                    >
                        <Plus size={16} />
                        <span>Add Class / Dept</span>
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Search Toolbar */}
            <div className="flex items-center bg-white border border-slate-200/80 p-3 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                        type="text"
                        placeholder="Search class or dept name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                    />
                </div>
            </div>

            {/* Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {loading ? (
                    Array(3).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-xs" />
                    ))
                ) : filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept) => (
                        <div
                            key={dept._id}
                            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between"
                        >
                            <div className="space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <Building2 size={20} />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(dept)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                                            title="Edit Unit"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                                            title="Delete Unit"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                                        {dept.name}
                                    </h3>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                                        {dept.description || 'General classroom track with automated biometric attendance.'}
                                    </p>
                                </div>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                    <Users size={14} className="text-slate-400" />
                                    <span className="font-semibold text-slate-700">{dept.employeeCount || 0} Enrolled</span>
                                </div>
                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium text-[11px]">
                                    Active Track
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-16 bg-white border border-slate-200/80 rounded-2xl text-center text-slate-400 shadow-xs">
                        <Building2 size={36} className="mx-auto mb-2 opacity-30" />
                        <p className="text-xs font-semibold">No classes or departments found</p>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-900">
                                    {isEditMode ? 'Edit Class / Department' : 'Create New Class / Dept'}
                                </h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Class / Dept Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Web Development 01"
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Description</label>
                                    <textarea
                                        rows={3}
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Brief description of curriculum or department scope..."
                                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Lead Instructor / Head</label>
                                    <select
                                        value={formData.head}
                                        onChange={(e) => setFormData({ ...formData, head: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 outline-none focus:bg-white focus:border-blue-500 transition-colors capitalize"
                                    >
                                        <option value="">Unassigned</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>
                                                {emp.firstName} {emp.lastName} ({emp.position})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors"
                                    >
                                        {isEditMode ? 'Update Unit' : 'Create Unit'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
