'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { EmployeeCreateData } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Users, UserPlus } from 'lucide-react';

export default function CreateEmployeePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const typeFromUrl = searchParams.get('type') as 'employee' | 'student' | null;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionError, setSubmissionError] = useState<string | null>(null);

    const isStudent = typeFromUrl === 'student';

    const handleSubmit = async (employee: EmployeeCreateData) => {
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            await EmployeeService.createEmployee(employee);
            toast.success('Record created successfully!');
            router.push(`/dashboard/management/employee${employee.type === 'student' ? '?type=student' : ''}`);
        } catch (error: any) {
            console.error('Submission error:', error);
            let message = 'Failed to register record. Please verify all inputs and try again.';
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
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Breadcrumb Navigation */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <Link
                        href="/dashboard/management/employee"
                        className="flex items-center gap-1.5 text-slate-800 hover:text-black transition-colors"
                    >
                        <Users size={15} />
                        <span>Directory</span>
                    </Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="text-black font-black">
                        {isStudent ? 'Enroll Student' : 'New Faculty / Staff'}
                    </span>
                </div>

                <button
                    onClick={() => router.push(`/dashboard/management/employee${isStudent ? '?type=student' : ''}`)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Directory</span>
                </button>
            </div>

            {/* Main Form */}
            <EmployeeForm
                initialType={typeFromUrl || 'employee'}
                onSubmit={handleSubmit}
                onCancel={() => router.push(`/dashboard/management/employee${isStudent ? '?type=student' : ''}`)}
                error={submissionError}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
