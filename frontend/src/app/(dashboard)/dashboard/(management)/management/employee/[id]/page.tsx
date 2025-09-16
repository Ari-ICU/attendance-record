'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import EmployeeDetail from '@/components/employee/EmployeeDetail';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

export default function EmployeeDetailPage() {
    const router = useRouter();
    const params = useParams();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const { id } = params;

    useEffect(() => {
        async function fetchEmployee() {
            try {
                // Replace this with your real API call
                const response = await fetch(`/api/employees/${id}`);
                if (!response.ok) throw new Error('Employee not found');

                const data: Employee = await response.json();
                setEmployee(data);
            } catch (error: unknown) {
                // Narrow unknown to Error
                if (error instanceof Error) {
                    toast.error(error.message);
                } else {
                    toast.error('Failed to load employee');
                }
                router.back();
            }
        }

        fetchEmployee();
    }, [id, router]);


    if (!employee) return <div className="p-6 text-gray-700 dark:text-gray-200">Loading...</div>;

    return <EmployeeDetail employee={employee} />;
}
