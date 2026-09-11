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
    RotateCcw
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
            toast.error('Failed to load organizational data');
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
                toast.success('Department updated successfully');
            } else {
                await DepartmentService.create(formData);
                toast.success('Department created successfully');
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
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await DepartmentService.delete(id);
            toast.success('Department deleted');
            fetchData();
        } catch (error) {
            toast.error('Delete failed');
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Departments & Teams</h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">Manage company organizational units, leads, and headcounts</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors w-48 sm:w-60 text-xs sm:text-sm"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs sm:text-sm hover:bg-blue-500 transition-colors shadow-sm whitespace-nowrap active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Department
                    </button>
                </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-48 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
                    ))
                ) : filteredDepartments.length === 0 ? (
                    <div className="col-span-full py-16 text-center bg-slate-900 rounded-2xl border border-slate-800">
                        <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-slate-300">No departments found</p>
                        <p className="text-xs text-slate-500 mt-0.5">Click Add Department to create your first organizational unit</p>
                    </div>
                ) : (
                    filteredDepartments.map((dept) => (
                        <div
                            key={dept._id}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors relative flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-start justify-between gap-3 mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                                            <Building2 className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white tracking-tight">{dept.name}</h3>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                <span className="text-[11px] font-medium text-slate-400">Active</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => openEditModal(dept)}
                                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                            title="Edit"
                                        >
                                            <Settings2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(dept._id)}
                                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[32px]">
                                    {dept.description || 'No description provided for this department.'}
                                </p>
                            </div>

                            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    {dept.head ? (
                                        <>
                                            <div className="w-7 h-7 rounded-full border border-slate-700 overflow-hidden bg-slate-800 shrink-0">
                                                {dept.head.photoUrl ? (
                                                    <img src={getFullImageUrl(dept.head.photoUrl) || ''} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                        {dept.head.firstName?.charAt(0)}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs font-medium text-slate-300 truncate max-w-[120px]">{dept.head.firstName} {dept.head.lastName}</span>
                                        </>
                                    ) : (
                                        <span className="text-xs text-slate-500 italic">No head assigned</span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-blue-400 text-xs font-semibold">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>{dept.memberCount || 0} members</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative"
                        >
                            <div className="flex items-center justify-between mb-5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                                        <Building2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-white">{isEditMode ? 'Edit Department' : 'Create Department'}</h2>
                                        <p className="text-xs text-slate-400">{isEditMode ? 'Modify department settings' : 'Set up a new organizational unit'}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsCreateModalOpen(false)} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Department Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. Engineering"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm font-medium text-white outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Description</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Department scope and responsibilities..."
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-white outline-none focus:border-blue-500 transition-colors resize-none"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400">Department Head</label>
                                    <select
                                        value={formData.head}
                                        onChange={e => setFormData(prev => ({ ...prev, head: e.target.value }))}
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs sm:text-sm text-slate-200 outline-none focus:border-blue-500 transition-colors"
                                    >
                                        <option value="">No Head Assigned</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-3 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold text-xs hover:bg-slate-700 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs hover:bg-blue-500 transition-colors shadow-sm"
                                    >
                                        {isEditMode ? 'Save Changes' : 'Create Department'}
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

