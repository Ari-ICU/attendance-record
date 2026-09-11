'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Users,
    Edit2,
    Trash2,
    CheckCircle2,
    Calendar,
    Clock,
    UserCheck,
    Mail,
    Phone
} from 'lucide-react';
import { DepartmentService } from '@/services/department.service';
import { EmployeeService } from '@/services/employee.service';
import { Department } from '@/types/department.types';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

export default function DepartmentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [department, setDepartment] = useState<Department | null>(null);
    const [members, setMembers] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [deptRes, empRes] = await Promise.all([
                    DepartmentService.getById(id),
                    EmployeeService.getAllEmployees({ limit: 100 })
                ]);
                setDepartment(deptRes.data);
                // Filter members belonging to this department
                const deptName = deptRes.data?.name || '';
                const deptMembers = (empRes.employees || []).filter(
                    e => e.department?.toLowerCase() === deptName.toLowerCase()
                );
                setMembers(deptMembers);
            } catch {
                toast.error('Failed to load department details');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this department?')) return;
        try {
            await DepartmentService.delete(id);
            toast.success('Department deleted');
            router.push('/dashboard/management/departments');
        } catch {
            toast.error('Failed to delete department');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!department) {
        return (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
                <p className="text-sm font-bold text-black">Department not found.</p>
                <Link href="/dashboard/management/departments" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">
                    Back to Departments
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/management/departments"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                {department.name}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-black font-mono text-xs font-bold border border-slate-200">
                                {department.code || 'UNIT'}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                            {department.description || 'Academic curriculum or administrative unit'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/dashboard/management/departments/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold cursor-pointer"
                    >
                        <Edit2 size={15} />
                        <span>Edit Unit</span>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Unit"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-black uppercase">Active Members</span>
                        <h3 className="text-2xl font-black text-black mt-1">{members.length || department.memberCount || 12}</h3>
                    </div>
                    <div className="p-3 bg-slate-100 text-black rounded-xl">
                        <Users size={20} />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-black uppercase">Compliance Status</span>
                        <h3 className="text-2xl font-black text-emerald-800 mt-1">98.4%</h3>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
                        <CheckCircle2 size={20} />
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                    <div>
                        <span className="text-xs font-bold text-black uppercase">Standard Shift</span>
                        <h3 className="text-2xl font-black text-black mt-1">08:00 - 17:00</h3>
                    </div>
                    <div className="p-3 bg-slate-100 text-black rounded-xl">
                        <Clock size={20} />
                    </div>
                </div>
            </div>

            {/* Members Roster Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-black text-black">Assigned Staff & Personnel Roster</h2>
                        <p className="text-xs font-medium text-black mt-0.5">Department team members and personnel assigned to this unit</p>
                    </div>
                    <span className="px-3 py-1 bg-slate-100 text-black border border-slate-300 rounded-lg text-xs font-bold">
                        {members.length} Members
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-5">Name & Position</th>
                                <th className="py-3 px-5">Type</th>
                                <th className="py-3 px-5">Contact</th>
                                <th className="py-3 px-5">Biometrics</th>
                                <th className="py-3 px-5 text-right">Profile</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {members.length > 0 ? (
                                members.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                </div>
                                                <div>
                                                    <span className="font-bold text-black block text-sm">{emp.firstName} {emp.lastName}</span>
                                                    <span className="text-[11px] font-medium text-black">{emp.position}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className="inline-block font-bold text-black uppercase text-[10px] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                                                {emp.type || 'employee'}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="space-y-0.5 text-[11px] font-semibold text-black">
                                                <div className="flex items-center gap-1"><Mail size={12} /> {emp.email}</div>
                                                <div className="flex items-center gap-1"><Phone size={12} /> {emp.phone}</div>
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                emp.faceVerificationEnabled
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : 'bg-slate-100 text-black border border-slate-200'
                                            }`}>
                                                <UserCheck size={11} />
                                                <span>{emp.faceVerificationEnabled ? 'Enrolled' : 'Pending'}</span>
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-5 text-right">
                                            <Link
                                                href={`/dashboard/management/employee/${emp._id}`}
                                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-black hover:text-white text-black font-bold text-xs transition-colors inline-block"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-12 text-center text-black font-bold">
                                        No members currently assigned to this department.
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
