'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmployeeDetail from '@/components/employee/EmployeeDetail';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [loading, setLoading] = useState(true);
    const { id } = params as { id: string };

    useEffect(() => {
        async function fetchEmployee() {
            try {
                setLoading(true);
                const data = await EmployeeService.getEmployeeById(id);
                setEmployee(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error('Failed to load profile');
                }
                router.push('/dashboard/management/employee');
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchEmployee();
    }, [id, router]);

    if (loading) {
        return (
            <div className="w-full flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-black rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-800">Loading profile data...</p>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <p className="text-sm font-bold text-black">Employee profile not found.</p>
                <button
                    onClick={() => router.push('/dashboard/management/employee')}
                    className="px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
                >
                    Back to Staff Directory
                </button>
            </div>
        );
    }

    return <EmployeeDetail employee={employee} />;
}
