'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { Employee, EmployeeUpdateData } from '@/types/employee.types';

import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export default function EditEmployeePage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params as { id: string };

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const data = await EmployeeService.getEmployeeById(id);
                setEmployee(data);
            } catch (error) {
                toast.error('Failed to fetch employee details');
                router.push('/dashboard/management/employee');
            }
        };

        if (id) fetchEmployee();
    }, [id, router]);

    const handleSubmit = async (updated: any) => {
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            await EmployeeService.updateEmployee(id, updated);
            toast.success(`${updated.type === 'student' ? 'Student' : 'Employee'} updated successfully!`);
            router.push(`/dashboard/management/employee/${id}`);
        } catch (error: any) {
            console.error('Update error:', error);
            let message = 'Failed to update. Please try again.';
            if (error.response?.data) {
                const responseData = error.response.data;
                message = responseData.error || responseData.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            setSubmissionError(message);
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!employee) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="">
            <EmployeeForm
                initialData={employee}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/dashboard/management/employee/${id}`)}
                error={submissionError}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
