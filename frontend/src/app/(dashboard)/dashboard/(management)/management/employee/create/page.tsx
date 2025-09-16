'use client';

import { useRouter } from 'next/navigation';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { EmployeeCreateData } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export default function CreateEmployeePage() {
    const router = useRouter();

    const handleSubmit = async (employee: EmployeeCreateData) => {
        try {
            // Call the API to create the employee
            await EmployeeService.createEmployee(employee);
            toast.success('Employee created successfully!');
            router.push('/dashboard/management/employee');
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error('Failed to create employee');
            }
        }
    };

    return (
        <div className="p-6 bg-gray-800 min-h-screen">
            <h1 className="text-2xl text-gray-200 font-bold mb-6">Create Employee</h1>
            <EmployeeForm
                onSubmit={handleSubmit}
                onCancel={() => router.push('/dashboard/management/employee')}
            />
        </div>
    );
}
