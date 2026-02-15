'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight">
                        {typeFilter === 'student' ? 'Student Management' : typeFilter === 'employee' ? 'Employee Management' : 'People Management'}
                    </h1>
                    <p className="text-slate-400 mt-1 font-medium">
                        {typeFilter === 'student' ? 'Manage your students, classes, and academic records.' : 'Manage your team, roles, and access controls.'}
                    </p>
                </div>

                <Link
                    href={`/dashboard/management/employee/create?type=${typeFilter || 'employee'}`}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-medium"
                >
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
