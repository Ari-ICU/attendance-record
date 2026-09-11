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
    DollarSign,
    CreditCard
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EmployeeDetailProps {
    employee: Employee;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
    const router = useRouter();

    const infoItems = [
        { icon: <Mail className="w-4 h-4" />, label: 'Email', value: employee.email },
        { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: employee.phone },
        { icon: <Briefcase className="w-4 h-4" />, label: 'Position', value: employee.position },
        { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: employee.department || 'General' },
        { icon: <Calendar className="w-4 h-4" />, label: 'Joining Date', value: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A' },
        { icon: <Fingerprint className="w-4 h-4" />, label: 'Face ID', value: employee.faceVerificationEnabled ? 'Enabled' : 'Disabled' },
        { icon: <CreditCard className="w-4 h-4" />, label: 'Bank', value: employee.bankDetails?.bankName || 'Not Set' },
        { icon: <CreditCard className="w-4 h-4" />, label: 'Account No.', value: employee.bankDetails?.accountNumber || 'Not Set' },
        { icon: <User className="w-4 h-4" />, label: 'Acc. Name', value: employee.bankDetails?.accountName || 'Not Set' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to List</span>
                </button>

                <button
                    onClick={() => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition-colors text-xs sm:text-sm font-semibold active:scale-95"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                </button>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                {/* Header Section */}
                <div className="p-6 sm:p-8 border-b border-slate-800 bg-slate-950/40">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shrink-0 flex items-center justify-center">
                            {employee.photoUrl ? (
                                <img
                                    src={getFullImageUrl(employee.photoUrl) || ''}
                                    alt={employee.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-12 h-12 text-slate-600" />
                            )}
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 text-center sm:text-left space-y-2">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                    {employee.fullName}
                                </h1>
                                {employee.isActive ? (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Active
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[11px] font-semibold">
                                        <XCircle className="w-3 h-3" />
                                        Inactive
                                    </span>
                                )}
                                <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase border ${employee.type === 'student'
                                    ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                    : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                    {employee.type || 'Employee'}
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 font-medium">
                                {employee.position}
                            </p>

                            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                                    <span>{employee.department || 'General'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                                    <span>Joined {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                {employee.baseSalary ? (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300">
                                        <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>Base: ${employee.baseSalary}</span>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="p-6 sm:p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {infoItems.map((item, index) => (
                            <div key={index} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                                <div className="flex items-center gap-2 text-slate-400 text-xs">
                                    {item.icon}
                                    <span className="font-medium">{item.label}</span>
                                </div>
                                <p className="text-sm font-semibold text-white truncate pl-6">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Face verification status */}
                <div className="mx-6 sm:mx-8 mb-6 sm:mb-8 p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-xl ${employee.faceVerificationEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-xs sm:text-sm font-bold text-white">Biometric Face ID Status</h4>
                            <p className="text-xs text-slate-400">Face recognition is {employee.faceVerificationEnabled ? 'enrolled and active' : 'not configured yet'}.</p>
                        </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-md border ${
                        employee.faceVerificationEnabled ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}>
                        {employee.faceVerificationEnabled ? 'Enrolled' : 'Not Enrolled'}
                    </span>
                </div>
            </div>
        </div>
    );
}

