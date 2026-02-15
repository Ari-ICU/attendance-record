'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { EmployeeCreateData } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';

export default function CreateEmployeePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeFromUrl = searchParams.get('type') as 'employee' | 'student' | 'employee';

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const handleSubmit = async (employee: EmployeeCreateData) => {
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            // Call the API to create the employee
            await EmployeeService.createEmployee(employee);
            toast.success(`${employee.type === 'student' ? 'Student' : 'Employee'} created successfully!`);
            router.push(`/dashboard/management/employee${employee.type === 'student' ? '?type=student' : ''}`);
        } catch (error: any) {
            console.error('Submission error:', error);
            let message = 'Failed to create employee. Please check your connection or try again.';

            // Handle Axios error structure
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

    return (
        <div className="">
            <EmployeeForm
                initialType={typeFromUrl || 'employee'}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/dashboard/management/employee${typeFromUrl === 'student' ? '?type=student' : ''}`)}
                error={submissionError}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
