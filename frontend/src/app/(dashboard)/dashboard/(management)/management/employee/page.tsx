'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
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
            console.error('Failed to delete employee', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                        {typeFilter === 'student' ? 'Student Management' : typeFilter === 'employee' ? 'Employee Management' : 'People Management'}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                        {typeFilter === 'student' ? 'Manage your students, classes, and attendance records.' : 'Manage personnel directory, roles, and status.'}
                    </p>
                </div>

                <Link
                    href={`/dashboard/management/employee/create?type=${typeFilter || 'employee'}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-colors text-xs sm:text-sm font-semibold active:scale-95 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    <span>Add {typeFilter === 'student' ? 'Student' : 'Employee'}</span>
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

