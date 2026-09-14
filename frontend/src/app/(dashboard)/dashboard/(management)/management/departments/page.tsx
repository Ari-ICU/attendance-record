'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Users,
    Plus,
    Search,
    Trash2,
    Building2,
    Briefcase,
    X,
    RotateCcw,
    Edit2,
    ShieldCheck,
    CheckCircle2,
    Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { DepartmentService } from '@/services/department.service';
import { EmployeeService } from '@/services/employee.service';
import { PositionService } from '@/services/position.service';
import { getFullImageUrl } from '@/utils/url.utils';
import { Department } from '@/types/department.types';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';

interface PositionItem {
    id: string;
    title: string;
    department: string;
    employeeCount?: number;
    description: string;
    level: string;
}

const DEFAULT_POSITIONS: PositionItem[] = [
    { id: 'pos_001', title: 'System Administrator', department: 'Engineering & IT', employeeCount: 0, description: 'Manages server infrastructure, cloud networks, and biometric IoT endpoints.', level: 'Senior' },
    { id: 'pos_002', title: 'Lead UX Architect', department: 'Product & Design', employeeCount: 0, description: 'Design system governance, UX flow architecture, and user research coordination.', level: 'Executive' },
    { id: 'pos_003', title: 'HR Director', department: 'Human Resources', employeeCount: 0, description: 'Workforce governance, hiring pipeline, payroll coordination, and staff wellness.', level: 'Executive' },
    { id: 'pos_004', title: 'Operations Manager', department: 'Operations & Facilities', employeeCount: 0, description: 'Campus logistics, security operations, gate check-in monitors, and facilities.', level: 'Mid-Level' },
    { id: 'pos_005', title: 'Senior Backend Engineer', department: 'Engineering & IT', employeeCount: 0, description: 'Microservices architecture, API integrations, and database scalability.', level: 'Senior' },
    { id: 'pos_006', title: 'Frontend Engineer', department: 'Engineering & IT', employeeCount: 0, description: 'Web application development, dashboard UI design, and portal maintenance.', level: 'Mid-Level' },
];

export default function DepartmentsPage() {
    const { user } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();
    const activeView = searchParams.get('view') === 'positions' ? 'positions' : 'departments';

    const [departments, setDepartments] = useState<Department[]>([]);
    const [positions, setPositions] = useState<PositionItem[]>(DEFAULT_POSITIONS);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Department Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        head: ''
    });

    // Position Form state
    const [positionFormData, setPositionFormData] = useState({
        title: '',
        department: 'Engineering & IT',
        description: '',
        level: 'Mid-Level'
    });

    const [isEditMode, setIsEditMode] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [deptRes, empRes, posRes] = await Promise.all([
                DepartmentService.getAll(),
                EmployeeService.getAllEmployees({ limit: 1000 }),
                PositionService.getAll()
            ]);
            setDepartments(deptRes.data || []);
            const emps = empRes.employees || [];
            setEmployees(emps);
            if (posRes && posRes.length > 0) {
                setPositions(posRes.map(p => ({
                    id: p.id || p._id || `pos_${Math.random()}`,
                    title: p.title,
                    department: p.department,
                    description: p.description || '',
                    level: p.level || 'Mid-Level',
                    employeeCount: 0
                })));
            }
        } catch {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSwitchView = (view: 'departments' | 'positions') => {
        if (view === 'positions') {
            router.push('/dashboard/management/departments?view=positions');
        } else {
            router.push('/dashboard/management/departments');
        }
    };

    const handleDeptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && activeId) {
                await DepartmentService.update(activeId, formData);
                toast.success('Class / Department updated successfully');
            } else {
                await DepartmentService.create(formData);
                toast.success('Class / Department created successfully');
            }
            setIsCreateModalOpen(false);
            setFormData({ name: '', description: '', head: '' });
            setIsEditMode(false);
            setActiveId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const handlePositionSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode && activeId) {
                try {
                    await PositionService.update(activeId, positionFormData);
                } catch {
                    // Fallback local update
                }
                setPositions(prev => prev.map(p => p.id === activeId ? {
                    ...p,
                    title: positionFormData.title,
                    department: positionFormData.department,
                    description: positionFormData.description,
                    level: positionFormData.level
                } : p));
                toast.success('Position updated successfully');
            } else {
                let newPosId = `pos_${Date.now()}`;
                try {
                    const created = await PositionService.create(positionFormData);
                    if (created?.id) newPosId = created.id;
                } catch {
                    // Fallback local create
                }
                const newPos: PositionItem = {
                    id: newPosId,
                    title: positionFormData.title,
                    department: positionFormData.department,
                    description: positionFormData.description,
                    employeeCount: 0,
                    level: positionFormData.level
                };
                setPositions(prev => [newPos, ...prev]);
                toast.success('Position added successfully');
            }
            setIsCreateModalOpen(false);
            setPositionFormData({ title: '', department: 'Engineering & IT', description: '', level: 'Mid-Level' });
            setIsEditMode(false);
            setActiveId(null);
            fetchData();
        } catch (error: any) {
            toast.error(error.message || 'Action failed');
        }
    };

    const openEditDeptModal = (dept: Department) => {
        setFormData({
            name: dept.name,
            description: dept.description || '',
            head: (dept.headOfDepartment as any)?._id || ''
        });
        setIsEditMode(true);
        setActiveId(dept._id);
        setIsCreateModalOpen(true);
    };

    const openEditPosModal = (pos: PositionItem) => {
        setPositionFormData({
            title: pos.title,
            department: pos.department,
            description: pos.description,
            level: pos.level
        });
        setIsEditMode(true);
        setActiveId(pos.id);
        setIsCreateModalOpen(true);
    };

    const openCreateModal = () => {
        if (activeView === 'departments') {
            setFormData({ name: '', description: '', head: '' });
        } else {
            setPositionFormData({ title: '', department: departments[0]?.name || 'Engineering & IT', description: '', level: 'Mid-Level' });
        }
        setIsEditMode(false);
        setActiveId(null);
        setIsCreateModalOpen(true);
    };

    const handleDeleteDept = async (id: string) => {
        if (!confirm('Are you sure you want to delete this unit?')) return;
        try {
            await DepartmentService.delete(id);
            toast.success('Class / Department deleted');
            fetchData();
        } catch {
            toast.error('Failed to delete');
        }
    };

    const handleDeletePos = async (id: string) => {
        if (!confirm('Are you sure you want to delete this position?')) return;
        try {
            await PositionService.delete(id);
        } catch {
            // local fallback
        }
        setPositions(prev => prev.filter(p => p.id !== id));
        toast.success('Position deleted');
    };

    const isAdmin = Boolean(user && ['admin', 'superadmin'].includes(user.role || ''));
    const isTeamLead = Boolean(user && (user.role === 'manager' || /lead|manager|head|director|supervisor/i.test(user.position || '')));
    const userDeptName = user?.department || '';

    const getPositionHeadcount = (pos: PositionItem) => {
        return employees.filter(e => {
            const eDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
            const deptMatch = !pos.department || (eDept || '').trim().toLowerCase() === pos.department.trim().toLowerCase();
            const posMatch = (e.position || '').trim().toLowerCase() === pos.title.trim().toLowerCase();
            return posMatch && deptMatch;
        }).length;
    };

    // Scope departments: Admins see all; Team Leads and Staff ONLY see their own department
    const scopedDepartments = isAdmin
        ? departments
        : departments.filter(d => d.name.toLowerCase() === userDeptName.toLowerCase());

    // Scope positions: Admins see all; Team Leads and Staff ONLY see their department positions
    const scopedPositions = isAdmin
        ? positions
        : positions.filter(p => p.department.toLowerCase() === userDeptName.toLowerCase());

    const filteredDepartments = scopedDepartments.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPositions = scopedPositions.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-12 font-sans max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>
                                {isAdmin
                                    ? (activeView === 'departments' ? 'Classes & Departments' : 'Staff Positions & Designations')
                                    : (activeView === 'departments' ? `${userDeptName || 'My'} Department & Team` : `${userDeptName || 'Department'} Roles & Positions`)}
                            </span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-white text-[11px] sm:text-xs font-bold shadow-2xs shrink-0">
                            {activeView === 'departments' ? `${filteredDepartments.length} Unit` : `${filteredPositions.length} Roles`}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black mt-1">
                        {isAdmin
                            ? (activeView === 'departments'
                                ? 'Configure academic classes, course units, instructors, and workforce headcounts across all organization.'
                                : 'Define campus organizational titles, responsibility scopes, and seniority tiers.')
                            : `View your assigned department structure, team lead, colleagues, and role scope in ${userDeptName}.`}
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    {isAdmin && (
                        <Link
                            href={activeView === 'departments' ? "/dashboard/management/departments/create" : "/dashboard/management/positions/create"}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
                        >
                            <Plus size={16} />
                            <span>{activeView === 'departments' ? 'Add Class / Dept' : 'Add Position'}</span>
                        </Link>
                    )}
                    <button
                        onClick={fetchData}
                        className="p-2.5 rounded-xl bg-white border border-slate-300 text-black hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer shrink-0"
                        title="Reload Data"
                    >
                        <RotateCcw size={15} />
                    </button>
                </div>
            </div>

            {/* Navigation Switcher & Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4 bg-white border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl shadow-xs">
                {/* View Switcher Tabs */}
                <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                        onClick={() => handleSwitchView('departments')}
                        className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                            activeView === 'departments'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-black hover:bg-slate-200'
                        }`}
                    >
                        <Building2 size={14} />
                        <span>Departments</span>
                    </button>
                    <button
                        onClick={() => handleSwitchView('positions')}
                        className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex-1 sm:flex-initial cursor-pointer ${
                            activeView === 'positions'
                                ? 'bg-black text-white shadow-xs'
                                : 'text-black hover:bg-slate-200'
                        }`}
                    >
                        <Briefcase size={14} />
                        <span>Positions</span>
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={15} />
                    <input
                        type="text"
                        placeholder={activeView === 'departments' ? "Search class or department..." : "Search position title or department..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>
            </div>

            {/* Content Area */}
            {activeView === 'departments' ? (
                /* Departments Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {loading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="h-48 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-xs" />
                        ))
                    ) : filteredDepartments.length > 0 ? (
                        filteredDepartments.map((dept) => {
                            const deptEmployees = employees.filter(
                                e => {
                                    const eDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
                                    return eDept?.toLowerCase() === dept.name?.toLowerCase();
                                }
                            );

                            const deptHead = dept.head && typeof dept.head === 'object'
                                ? dept.head as any
                                : (dept.headOfDepartment ? {
                                    firstName: dept.headOfDepartment.firstName,
                                    lastName: dept.headOfDepartment.lastName,
                                    position: 'Team Leader'
                                } : null);

                            const isMyDept = user?.department && dept.name?.toLowerCase() === user.department?.toLowerCase();

                            return (
                                <div
                                    key={dept._id}
                                    className={`bg-white border rounded-2xl p-5 shadow-xs hover:border-black transition-all flex flex-col justify-between ${
                                        isMyDept ? 'border-blue-400 ring-1 ring-blue-400/30' : 'border-slate-200/80'
                                    }`}
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="p-2.5 bg-black text-white rounded-xl shadow-2xs">
                                                    <Building2 size={20} />
                                                </div>
                                                {isMyDept && (
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                                                        My Department
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Link
                                                    href={`/dashboard/management/departments/${dept._id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg text-xs transition-colors inline-block"
                                                >
                                                    View Team
                                                </Link>
                                                {isAdmin && (
                                                    <>
                                                        <Link
                                                            href={`/dashboard/management/departments/${dept._id}/edit`}
                                                            className="p-1.5 rounded-lg text-black hover:bg-slate-100 transition-colors inline-block"
                                                            title="Edit Unit"
                                                        >
                                                            <Edit2 size={15} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDeleteDept(dept._id)}
                                                            className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Delete Unit"
                                                        >
                                                            <Trash2 size={15} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <Link href={`/dashboard/management/departments/${dept._id}`} className="text-base font-black text-black leading-snug hover:underline">
                                                    {dept.name}
                                                </Link>
                                                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-black font-mono text-[10px] font-bold border border-slate-200">
                                                    {dept.code}
                                                </span>
                                            </div>
                                            <p className="text-xs font-medium text-black line-clamp-2 mt-1.5 leading-relaxed">
                                                {dept.description || 'General classroom track with automated biometric attendance.'}
                                            </p>
                                        </div>

                                        {/* Department Team Leader Pill */}
                                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/90 flex items-center justify-between">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <Crown size={14} className="text-amber-500 shrink-0" />
                                                <div className="min-w-0">
                                                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Team Lead / Manager</span>
                                                    <span className="text-xs font-bold text-black truncate block">
                                                        {deptHead ? `${deptHead.firstName} ${deptHead.lastName}` : 'Assigned by Admin'}
                                                    </span>
                                                </div>
                                            </div>
                                            {deptHead?.position && (
                                                <span className="text-[10px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                                                    {deptHead.position}
                                                </span>
                                            )}
                                        </div>

                                        {/* Child Team Members Avatars */}
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
                                                <span>Child Team Roster</span>
                                                <span>{deptEmployees.length || dept.memberCount || 0} Staff</span>
                                            </div>
                                            <div className="flex items-center -space-x-1.5 overflow-hidden py-0.5">
                                                {deptEmployees.slice(0, 5).map((m, idx) => (
                                                    <div
                                                        key={m._id || idx}
                                                        title={`${m.firstName} ${m.lastName} (${m.position || 'Staff'})`}
                                                        className="w-7 h-7 rounded-full bg-black text-white font-bold text-[10px] border-2 border-white flex items-center justify-center overflow-hidden shrink-0 shadow-2xs"
                                                    >
                                                        {m.photoUrl ? (
                                                            <img src={getFullImageUrl(m.photoUrl)} alt={m.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{m.firstName?.[0]}{m.lastName?.[0]}</span>
                                                        )}
                                                    </div>
                                                ))}
                                                {deptEmployees.length > 5 && (
                                                    <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-[10px] border-2 border-white flex items-center justify-center shrink-0">
                                                        +{deptEmployees.length - 5}
                                                    </div>
                                                )}
                                                {deptEmployees.length === 0 && (
                                                    <span className="text-[11px] text-slate-400 font-medium">No team members assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-2">
                                            <Users size={14} className="text-black" />
                                            <span className="font-bold text-black">{deptEmployees.length || dept.memberCount || 0} Members</span>
                                        </div>
                                        <Link
                                            href={`/dashboard/management/departments/${dept._id}`}
                                            className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 hover:bg-emerald-100 transition-colors"
                                        >
                                            <CheckCircle2 size={12} />
                                            <span>Active Unit</span>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-16 bg-white border border-slate-200/80 rounded-2xl text-center text-black shadow-xs">
                            <Building2 size={36} className="mx-auto mb-2 text-slate-400" />
                            <p className="text-sm font-bold text-black">No classes or departments found</p>
                        </div>
                    )}
                </div>
            ) : (
                /* Positions Table / Grid */
                <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                    <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-black text-black">Designations & Job Titles</h2>
                            <p className="text-xs font-medium text-black mt-0.5">Assigned roles across academic and administrative departments</p>
                        </div>
                        <span className="px-3 py-1 bg-slate-100 text-black border border-slate-300 rounded-lg text-xs font-bold">
                            {filteredPositions.length} Total Positions
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-black uppercase tracking-wider">
                                    <th className="py-3 px-5">Role Title</th>
                                    <th className="py-3 px-5">Department</th>
                                    <th className="py-3 px-5">Seniority Tier</th>
                                    <th className="py-3 px-5">Headcount</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredPositions.length > 0 ? (
                                    filteredPositions.map((pos) => (
                                        <tr key={pos.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-slate-100 text-black rounded-lg border border-slate-200">
                                                        <Briefcase size={15} />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-black block text-sm">{pos.title}</span>
                                                        <span className="text-[11px] font-medium text-black line-clamp-1">{pos.description}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="inline-block font-semibold text-black bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                    {pos.department}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="inline-flex items-center gap-1 font-bold text-black bg-blue-50 border border-blue-200 text-blue-900 px-2.5 py-1 rounded-md">
                                                    <ShieldCheck size={13} />
                                                    <span>{pos.level}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="font-bold text-black flex items-center gap-1.5">
                                                    <Users size={14} className="text-black" />
                                                    <span>{getPositionHeadcount(pos)} Staff</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                {isAdmin ? (
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button
                                                            onClick={() => openEditPosModal(pos)}
                                                            className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                            title="Edit Position"
                                                        >
                                                            <Edit2 size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeletePos(pos.id)}
                                                            className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Delete Position"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                        Active Scope
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center text-black font-bold">
                                            No positions matching your search.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create / Edit Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-300 rounded-2xl shadow-2xl p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                                <h3 className="text-base font-black text-black">
                                    {activeView === 'departments'
                                        ? (isEditMode ? 'Edit Department / Class' : 'Create New Class / Unit')
                                        : (isEditMode ? 'Edit Position' : 'Create New Position')}
                                </h3>
                                <button
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="p-1 rounded-lg text-black hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {activeView === 'departments' ? (
                                <form onSubmit={handleDeptSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Class / Dept Name</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Web Development 01"
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Description</label>
                                        <textarea
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            placeholder="Brief description of curriculum or department scope..."
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Lead Instructor / Head</label>
                                        <CustomDropdown
                                            value={formData.head}
                                            onChange={(val) => setFormData({ ...formData, head: val })}
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

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                                        >
                                            {isEditMode ? 'Update Unit' : 'Create Unit'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handlePositionSubmit} className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Position Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={positionFormData.title}
                                            onChange={(e) => setPositionFormData({ ...positionFormData, title: e.target.value })}
                                            placeholder="e.g. Lead Cloud Architect"
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Assigned Department</label>
                                        <CustomDropdown
                                            value={positionFormData.department}
                                            onChange={(val) => setPositionFormData({ ...positionFormData, department: val })}
                                            options={departments.map(dept => ({
                                                value: dept.name,
                                                label: dept.name
                                            }))}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Seniority Tier</label>
                                        <CustomDropdown
                                            value={positionFormData.level}
                                            onChange={(val) => setPositionFormData({ ...positionFormData, level: val })}
                                            options={[
                                                { value: 'Associate', label: 'Associate / Entry' },
                                                { value: 'Mid-Level', label: 'Mid-Level' },
                                                { value: 'Senior', label: 'Senior' },
                                                { value: 'Lead', label: 'Lead / Supervisor' },
                                                { value: 'Executive', label: 'Executive / Director' }
                                            ]}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-black">Role Scope & Description</label>
                                        <textarea
                                            rows={3}
                                            value={positionFormData.description}
                                            onChange={(e) => setPositionFormData({ ...positionFormData, description: e.target.value })}
                                            placeholder="Core responsibilities and duties..."
                                            className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setIsCreateModalOpen(false)}
                                            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-black font-bold rounded-xl text-xs transition-colors cursor-pointer"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 py-2.5 bg-black hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
                                        >
                                            {isEditMode ? 'Update Position' : 'Create Position'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

