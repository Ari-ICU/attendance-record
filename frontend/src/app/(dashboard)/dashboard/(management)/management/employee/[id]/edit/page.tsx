'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { Employee, EmployeeUpdateData } from '@/types/employee.types';

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [employee, setEmployee] = useState<Employee | null>(null);

    useEffect(() => {
        // TODO: replace with API call to fetch employee by ID
        const mockEmployee: Employee = {
            _id: id,
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
        };
        setEmployee(mockEmployee);
    }, [id]);

    const handleSubmit = (updated: EmployeeUpdateData) => {
        console.log('Update employee:', updated);
        // TODO: call API to update employee
        router.push('/dashboard/management/employee');
    };

    if (!employee) return <p>Loading...</p>;

    return (
        <div className="p-6 bg-gray-800">
            <h1 className="text-2xl text-gray-200 font-bold mb-6">Edit Employee</h1>
            <EmployeeForm
                initialData={employee}
                onSubmit={handleSubmit}
                onCancel={() => router.push('/dashboard/management/employee')}
            />
        </div>
    );
}
