'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Users, UserCheck } from 'lucide-react';
import EmployeeList from '@/components/employee/EmployeeList';
import { Employee } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';

export default function EmployeePage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const { employees: data } = await EmployeeService.getAllEmployees();
            setEmployees(data);
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
        try {
            await EmployeeService.deleteEmployee(id);
            setEmployees((prev) => prev.filter((e) => e._id !== id));
        } catch (error) {
            console.error('Failed to delete record', error);
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Header Banner */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
                <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                            <span>Employee Directory</span>
                        </h1>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-black text-xs font-bold border border-slate-300">
                            {employees.length} Staff Members
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-800 font-semibold">
                        Manage company employee profiles, departmental roles, biometric templates, and attendance status.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-start md:justify-end">
                    <Link
                        href="/dashboard/management/employee/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-black active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} />
                        <span>Add New Employee</span>
                    </Link>
                </div>
            </div>

            {/* List */}
            <EmployeeList
                employees={employees}
                onEdit={(employee) => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                onDelete={(id) => handleDelete(id)}
            />
        </div>
    );
}
