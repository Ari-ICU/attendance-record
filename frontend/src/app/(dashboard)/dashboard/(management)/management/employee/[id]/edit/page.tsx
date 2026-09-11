'use client';

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import EmployeeForm from '@/components/employee/EmployeeForm';
import { Employee, EmployeeUpdateData } from '@/types/employee.types';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Users, Edit3, User } from 'lucide-react';
import { getFullImageUrl } from '@/utils/url.utils';

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

    const handleSubmit = async (updated: EmployeeUpdateData) => {
        try {
            setIsSubmitting(true);
            setSubmissionError(null);
            await EmployeeService.updateEmployee(id, updated);
            toast.success('Record updated successfully!');
            router.push(`/dashboard/management/employee/${id}`);
        } catch (error: any) {
            console.error('Update error:', error);
            let message = 'Failed to update record. Please check inputs and try again.';
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

    if (!employee) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-3">
                <div className="w-9 h-9 border-3 border-slate-300 border-t-black rounded-full animate-spin" />
                <p className="text-xs font-bold text-slate-800">Loading profile data...</p>
            </div>
        );
    }

    const isStudent = employee.type === 'student';

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Breadcrumb Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <Link
                        href="/dashboard/management/employee"
                        className="flex items-center gap-1.5 text-slate-800 hover:text-black transition-colors"
                    >
                        <Users size={15} />
                        <span>Directory</span>
                    </Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <Link
                        href={`/dashboard/management/employee/${id}`}
                        className="text-slate-800 hover:text-black transition-colors"
                    >
                        {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                    </Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="text-black font-black flex items-center gap-1.5">
                        <Edit3 size={13} />
                        Edit Profile
                    </span>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push(`/dashboard/management/employee/${id}`)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={14} />
                        <span>Cancel & View</span>
                    </button>
                </div>
            </div>

            {/* Form */}
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
