'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EmployeeList from '@/components/employee/EmployeeList';
import { Employee } from '@/types/employee.types';

export default function EmployeePage() {
    const router = useRouter();

    // Mock data
    const [employees, setEmployees] = useState<Employee[]>([
        {
            _id: '1',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            email: 'john@example.com',
            phone: '123456789',
            position: 'Developer',
            department: 'Engineering',
            dateOfJoining: '2025-09-15',
            faceVerificationEnabled: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            _id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            fullName: 'Jane Smith',
            email: 'jane@example.com',
            phone: '987654321',
            position: 'Designer',
            department: 'Design',
            dateOfJoining: '2025-08-20',
            faceVerificationEnabled: false,
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
    ]);

    const handleDelete = (id: string) => {
        setEmployees((prev) => prev.filter((e) => e._id !== id));
    };

    return (
        <div className="p-6 bg-gray-800 h-screen ">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl text-gray-200 font-bold">Employee Management</h1>
                <Link
                    href="/dashboard/management/employee/create"
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                    Add Employee
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
