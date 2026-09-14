'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Briefcase,
    Plus,
    Search,
    Users,
    ShieldCheck,
    Edit2,
    Trash2,
    Building2
} from 'lucide-react';
import { PositionService } from '@/services/position.service';
import { EmployeeService } from '@/services/employee.service';
import { PositionItem } from '@/types/position.types';
import { Employee } from '@/types/employee.types';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

export default function PositionsPage() {
    const { user } = useAuth();
    const isAdmin = Boolean(user && ['admin', 'superadmin'].includes(user.role || ''));
    const isTeamLead = Boolean(user && (user.role === 'manager' || /lead|manager|head|director|supervisor/i.test(user.position || '')));
    const userDept = user?.department || '';

    const [positions, setPositions] = useState<PositionItem[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            const [posData, empRes] = await Promise.all([
                PositionService.getAll(),
                EmployeeService.getAllEmployees({ limit: 1000 })
            ]);
            setPositions(posData || []);
            setEmployees(empRes?.employees || []);
        } catch {
            toast.error('Failed to load positions data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        if (!confirm('Are you sure you want to delete this position?')) return;
        try {
            await PositionService.delete(id);
            setPositions(prev => prev.filter(p => p.id !== id && p._id !== id));
            toast.success('Position deleted successfully');
        } catch {
            toast.error('Failed to delete position');
        }
    };

    const getPositionHeadcount = (pos: PositionItem) => {
        return employees.filter(e => {
            const eDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
            const deptMatch = !pos.department || (eDept || '').trim().toLowerCase() === pos.department.trim().toLowerCase();
            const posMatch = (e.position || '').trim().toLowerCase() === pos.title.trim().toLowerCase();
            return posMatch && deptMatch;
        }).length;
    };

    // Scope positions: Admins see all; Team Leads and Staff ONLY see their department positions
    const scopedPositions = isAdmin
        ? positions
        : positions.filter(p => (p.department || '').toLowerCase() === userDept.toLowerCase());

    const filtered = scopedPositions.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-12 font-sans max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
                        <h1 className="text-lg sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>
                                {isAdmin ? 'Staff Positions & Roles' : `${userDept || 'Department'} Roles & Positions`}
                            </span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-[11px] sm:text-xs font-bold shrink-0">
                            {filtered.length} {filtered.length === 1 ? 'Role' : 'Roles'}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-black mt-1">
                        {isAdmin
                            ? 'Define campus titles, seniority tiers, and departmental assignments.'
                            : `View assigned job roles and responsibilities within ${userDept}.`}
                    </p>
                </div>

                {isAdmin && (
                    <Link
                        href="/dashboard/management/positions/create"
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold active:scale-95 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Add Position</span>
                    </Link>
                )}
            </div>

            {/* Search Toolbar */}
            <div className="flex items-center bg-white border border-slate-200/80 p-3 sm:p-3.5 rounded-2xl shadow-xs">
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={15} />
                    <input
                        type="text"
                        placeholder="Search position title or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>
            </div>

            {/* Positions Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
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
                            {filtered.length > 0 ? (
                                filtered.map((pos) => (
                                    <tr key={pos.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-slate-100 text-black rounded-lg border border-slate-200">
                                                    <Briefcase size={15} />
                                                </div>
                                                <div>
                                                    <Link href={`/dashboard/management/positions/${pos.id || pos._id}`} className="font-bold text-black block text-sm hover:underline">
                                                        {pos.title}
                                                    </Link>
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
                                            <span className="inline-flex items-center gap-1 font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-md">
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
                                            <div className="flex items-center justify-end gap-1.5">
                                                <Link
                                                    href={`/dashboard/management/positions/${pos.id || pos._id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors"
                                                >
                                                    View
                                                </Link>
                                                {isAdmin && (
                                                    <>
                                                        <Link
                                                            href={`/dashboard/management/positions/${pos.id || pos._id}/edit`}
                                                            className="p-1.5 rounded-lg text-black hover:bg-slate-200 transition-colors"
                                                            title="Edit Position"
                                                        >
                                                            <Edit2 size={14} />
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(pos.id || pos._id || '')}
                                                            className="p-1.5 rounded-lg text-black hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                                            title="Delete Position"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-black font-bold">
                                        No positions found for your department.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
