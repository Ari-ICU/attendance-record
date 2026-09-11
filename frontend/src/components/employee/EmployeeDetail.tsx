'use client';

import { Employee } from '@/types/employee.types';
import { getFullImageUrl } from '@/utils/url.utils';
import {
    Mail,
    Phone,
    Briefcase,
    Building2,
    Calendar,
    ShieldCheck,
    User,
    ArrowLeft,
    Edit3,
    CheckCircle2,
    XCircle,
    Fingerprint,
    CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeDetailProps {
    employee: Employee;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
    const router = useRouter();

    const infoItems = [
        { icon: <Mail className="w-4 h-4 text-blue-600" />, label: 'Email', value: employee.email },
        { icon: <Phone className="w-4 h-4 text-blue-600" />, label: 'Phone', value: employee.phone || 'N/A' },
        { icon: <Briefcase className="w-4 h-4 text-blue-600" />, label: 'Track / Position', value: employee.position || 'Student' },
        { icon: <Building2 className="w-4 h-4 text-blue-600" />, label: 'Class / Dept', value: employee.department || 'Academic Core' },
        { icon: <Calendar className="w-4 h-4 text-blue-600" />, label: 'Enrollment Date', value: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A' },
        { icon: <Fingerprint className="w-4 h-4 text-blue-600" />, label: 'Face Recognition', value: employee.faceVerificationEnabled ? 'Enrolled' : 'Pending' },
        { icon: <CreditCard className="w-4 h-4 text-blue-600" />, label: 'Bank Name', value: employee.bankDetails?.bankName || 'Not Set' },
        { icon: <CreditCard className="w-4 h-4 text-blue-600" />, label: 'Account Number', value: employee.bankDetails?.accountNumber || 'Not Set' },
        { icon: <User className="w-4 h-4 text-blue-600" />, label: 'Account Holder', value: employee.bankDetails?.accountName || 'Not Set' },
    ];

    const isStudent = employee.type === 'student';

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Directory</span>
                </button>

                <button
                    onClick={() => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs transition-colors text-xs sm:text-sm font-semibold active:scale-95"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                </button>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xs shrink-0 flex items-center justify-center">
                            {employee.photoUrl ? (
                                <img
                                    src={getFullImageUrl(employee.photoUrl) || ''}
                                    alt={employee.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12 text-slate-400" />
                            )}
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                                    {employee.fullName || `${employee.firstName} ${employee.lastName}`}
                                </h1>
                                {employee.isActive ? (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                                        <XCircle className="w-3 h-3" />
                                        Inactive
                                    </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase border ${isStudent
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                }`}>
                                    {employee.type || 'Student'}
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-slate-500 font-medium">
                                ID: <span className="font-mono text-slate-700 font-bold">{employee._id}</span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 sm:p-8">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Credentials & Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {infoItems.map((item, index) => (
                            <div key={index} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                    {item.icon}
                                    <span>{item.label}</span>
                                </div>
                                <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                                    {item.value || '---'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
