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
    const { id } = params as { id: string };

    useEffect(() => {
        async function fetchEmployee() {
            try {
                const data = await EmployeeService.getEmployeeById(id);
                setEmployee(data);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error('Failed to load employee');
                }
                router.back();
            }
        }

        if (id) fetchEmployee();
    }, [id, router]);


    if (!employee) return <div className="p-6 text-gray-700 dark:text-gray-200">Loading...</div>;

    return <EmployeeDetail employee={employee} />;
}
