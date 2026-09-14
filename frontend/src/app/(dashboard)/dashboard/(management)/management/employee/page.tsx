'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, UserCheck } from 'lucide-react';
import EmployeeList from '@/components/employee/EmployeeList';
import { Employee } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import { useAuth } from '@/contexts/AuthContext';

export default function EmployeePage() {
    const router = useRouter();
    const { user } = useAuth();
    const isAdmin = Boolean(user && ['admin', 'superadmin'].includes(user.role || ''));
    const isTeamLead = Boolean(user && (user.role === 'manager' || /lead|manager|head|director|supervisor/i.test(user.position || '')));
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { employees: data } = await EmployeeService.getAllEmployees();
            setEmployees(data || []);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleDelete = async (id: string) => {
        if (!isAdmin) return;
        try {
            await EmployeeService.deleteEmployee(id);
            setEmployees((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Failed to delete record', error);
        }
    };

    // Admins see all employees; Team Leads and Staff ONLY see members belonging to their department
    const userDept = user?.department || '';
    const visibleEmployees = isAdmin
        ? employees
        : employees.filter(e => {
            const empDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
            return empDept?.toLowerCase() === userDept.toLowerCase();
        });

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>
                                {isAdmin
                                    ? 'Employee Directory'
                                    : (isTeamLead ? `My Department Team (${userDept})` : `${userDept || 'Department'} Team Members`)}
                            </span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-black text-xs font-bold border border-slate-300">
                            {visibleEmployees.length} {visibleEmployees.length === 1 ? 'Member' : 'Team Members'}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                        {isAdmin
                            ? 'Manage company employee profiles, departmental roles, biometric templates, and attendance status.'
                            : (isTeamLead
                                ? `Personnel, positions, and biometric profiles under your ${userDept} leadership.`
                                : `Colleagues and team leads assigned to your department track.`)}
                    </p>
                </div>

                {isAdmin && (
                    <div className="flex items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
                        <Link
                            href="/dashboard/management/employee/create"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-black active:scale-95 whitespace-nowrap"
                        >
                            <Plus size={16} />
                            <span>Add New Employee</span>
                        </Link>
                    </div>
                )}
            </div>

            {/* List */}
            <EmployeeList
                employees={visibleEmployees}
                onEdit={(employee) => isAdmin ? router.push(`/dashboard/management/employee/${employee._id}/edit`) : undefined}
                onDelete={async (id) => {
                    if (isAdmin) await handleDelete(id);
                }}
            />
        </div>
    );
}
