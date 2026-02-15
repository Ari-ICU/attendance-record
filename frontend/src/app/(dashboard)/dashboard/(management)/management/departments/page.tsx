'use client';

import { useState, useEffect } from 'react';
import {
    Users,
    Plus,
    Search,
    MoreVertical,
    UserPlus,
    Settings2,
    Trash2,
    Building2,
    ShieldCheck,
    LineChart,
    ChevronRight,
    Loader2
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
                toast.success('Department protocols updated');
            } else {
                await DepartmentService.create(formData);
                toast.success('Department initialized successfully');
            }
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', head: '' });
            setIsEditMode(false);
            setActiveDepartmentId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Protocol failure');
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
        if (!confirm('Are you sure you want to decommission this department?')) return;
        try {
            await DepartmentService.delete(id);
            toast.success('Department decommissioned');
            fetchData();
        } catch (error) {
            toast.error('Decommissioning failed');
        }
    };

    const filteredDepartments = departments.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Organization Hub</h1>
                    <p className="text-slate-400 font-medium tracking-tight">Architect your organizational structure and leadership</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative group hidden sm:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Find department..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-white/5 border border-white/10 text-white pl-11 pr-4 py-2.5 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all w-64 text-sm font-bold uppercase tracking-widest placeholder:text-slate-600"
                        />
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 text-white font-black text-sm tracking-[0.1em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-95 whitespace-nowrap uppercase italic"
                    >
                        <Plus className="w-5 h-5" />
                        New Entity
                    </button>
                </div>
            </div>

            {/* Grid display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                    {loading ? (
                        [1, 2, 3].map(i => (
                            <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
                        ))
                    ) : filteredDepartments.length === 0 ? (
                        <div className="col-span-full py-20 text-center glass-pane rounded-3xl border border-white/10">
                            <Building2 className="w-16 h-16 text-slate-700 mx-auto mb-4" />
                            <p className="text-slate-500 font-black uppercase tracking-widest">No active departments found</p>
                        </div>
                    ) : (
                        filteredDepartments.map((dept, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.05 }}
                                key={dept._id}
                                className="group relative glass-pane p-6 rounded-3xl border border-white/10 hover:border-blue-500/30 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5"
                            >
                                <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => openEditModal(dept)}
                                        className="p-2 rounded-xl bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        <Settings2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(dept._id)}
                                        className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-5 mb-6">
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/10">
                                        <Building2 className="w-8 h-8 text-blue-400" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase italic">{dept.name}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Operational</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2 min-h-[40px]">
                                    {dept.description || 'No operational scope defined for this entity.'}
                                </p>

                                <div className="space-y-4 pt-6 border-t border-white/5">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        <span>leadership</span>
                                        <span>population</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {dept.head ? (
                                                <>
                                                    <div className="w-8 h-8 rounded-full border border-white/10 overflow-hidden bg-slate-800">
                                                        {dept.head.photoUrl && <img src={getFullImageUrl(dept.head.photoUrl) || ''} className="w-full h-full object-cover" />}
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-200">{dept.head.firstName} {dept.head.lastName}</span>
                                                </>
                                            ) : (
                                                <span className="text-[10px] font-bold text-slate-600 italic">No Head Assigned</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                            <Users className="w-3 h-3 text-blue-400" />
                                            <span className="text-xs font-black text-blue-400">{dept.memberCount || 0}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCreateModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-lg glass-pane rounded-[2.5rem] border border-white/10 p-8 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                    <Plus className="rotate-45 w-6 h-6" />
                                </button>
                            </div>

                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 rounded-2xl bg-blue-600/20 border border-blue-500/30">
                                    <Building2 className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white italic">{isEditMode ? 'Protocol: Edit Entity' : 'Protocol: New Entity'}</h2>
                                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{isEditMode ? 'Modify department configuration' : 'Initialize department structure'}</p>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Identity Designation</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. CORE ENGINEERING"
                                        value={formData.name}
                                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Functional Scope</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Detailed description of responsibilities..."
                                        value={formData.description}
                                        onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700 resize-none"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Executive Head</label>
                                    <select
                                        value={formData.head}
                                        onChange={e => setFormData(prev => ({ ...prev, head: e.target.value }))}
                                        className="w-full bg-slate-950/50 border border-white/5 rounded-2xl py-3.5 px-5 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all appearance-none uppercase tracking-widest"
                                    >
                                        <option value="">Awaiting Assignment</option>
                                        {employees.map(emp => (
                                            <option key={emp._id} value={emp._id}>{emp.firstName} {emp.lastName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsCreateModalOpen(false)}
                                        className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Abort
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-[2] py-4 rounded-2xl bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all italic"
                                    >
                                        {isEditMode ? 'Sync Configuration' : 'Initialize Entity'}
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
