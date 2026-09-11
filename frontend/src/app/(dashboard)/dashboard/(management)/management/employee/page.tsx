'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Users, User } from 'lucide-react';
import EmployeeList from '@/components/employee/EmployeeList';
import { Employee } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';

export default function EmployeePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeFilter = searchParams.get('type') as 'employee' | 'student' | null;

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const query = typeFilter ? { type: typeFilter } : {};
            const { employees: data } = await EmployeeService.getAllEmployees(query);
            setEmployees(data);
        } catch (error) {
            console.error('Failed to fetch employees', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, [typeFilter]);

    const handleDelete = async (id: string) => {
        try {
            await EmployeeService.deleteEmployee(id);
            setEmployees((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Failed to delete record', error);
        }
    };

    const isStudent = typeFilter === 'student';

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                        <span>{isStudent ? 'Student Directory' : 'Faculty & Staff Roster'}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
                            {employees.length} Enrolled
                        </span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold mt-1">
                        {isStudent ? 'Manage student IDs, class enrollments, and biometric templates.' : 'Manage employee profiles, departmental roles, and access clearances.'}
                    </p>
                </div>

                <Link
                    href={`/dashboard/management/employee/create?type=${typeFilter || 'employee'}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-semibold active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add {isStudent ? 'Student' : 'Staff Member'}</span>
                </Link>
            </div>

            <EmployeeList
                employees={employees}
                onEdit={(employee) => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                onDelete={(id) => handleDelete(id)}
            />
        </div>
    );
}
