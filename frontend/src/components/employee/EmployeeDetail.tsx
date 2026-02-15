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
    DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

interface EmployeeDetailProps {
    employee: Employee;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
    const router = useRouter();

    const infoItems = [
        { icon: <Mail className="w-5 h-5" />, label: 'Email', value: employee.email },
        { icon: <Phone className="w-5 h-5" />, label: 'Phone', value: employee.phone },
        { icon: <Briefcase className="w-5 h-5" />, label: 'Position', value: employee.position },
        { icon: <Building2 className="w-5 h-5" />, label: 'Department', value: employee.department || 'General' },
        { icon: <Calendar className="w-5 h-5" />, label: 'Joining Date', value: employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A' },
        { icon: <Fingerprint className="w-5 h-5" />, label: 'Face ID', value: employee.faceVerificationEnabled ? 'Enabled' : 'Disabled' },
    ];

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-12">
            {/* Action Bar */}
            <div className="flex justify-between items-center">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 text-slate-400 hover:text-white transition-colors group"
                >
                    <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    <span className="font-medium">Back to List</span>
                </button>

                <button
                    onClick={() => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 transition-all font-medium"
                >
                    <Edit3 className="w-4 h-4" />
                    <span>Edit Profile</span>
                </button>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-pane rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative"
            >
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    {/* Header Section */}
                    <div className="p-8 sm:p-12 border-b border-white/5 bg-white/[0.02]">
                        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Avatar */}
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                <div className="relative w-40 h-40 rounded-3xl overflow-hidden border-2 border-white/10 bg-slate-900 shadow-2xl">
                                    {employee.photoUrl ? (
                                        <img
                                            src={getFullImageUrl(employee.photoUrl) || ''}
                                            alt={employee.fullName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-950">
                                            <User className="w-16 h-16 text-slate-700" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="space-y-1">
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <h1 className="text-4xl font-black text-white tracking-tight">
                                            {employee.fullName}
                                        </h1>
                                        {employee.isActive ? (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-widest">
                                                <CheckCircle2 className="w-3 h-3" />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest">
                                                <XCircle className="w-3 h-3" />
                                                Inactive
                                            </span>
                                        )}
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${employee.type === 'student'
                                            ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            }`}>
                                            {employee.type || 'Employee'}
                                        </span>
                                    </div>
                                    <p className="text-xl text-slate-400 font-medium tracking-tight">
                                        {employee.position}
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                        <Building2 className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-semibold text-slate-300">{employee.department || 'General'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                        <Calendar className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-semibold text-slate-300">Joined {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}</span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                        <DollarSign className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm font-semibold text-slate-300">Base Salary {employee.baseSalary ? employee.baseSalary + ' $' : 'N/A'}</span>
                                    </div>


                                    <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                        <Building2 className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-semibold text-slate-300">Hourly Rate {employee.hourlyRate ? employee.hourlyRate + ' $' : 'N/A'}</span>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="p-8 sm:p-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {infoItems.map((item, index) => (
                                <div key={index} className="group p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-white/[0.04] transition-all duration-300">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform duration-300">
                                            {item.icon}
                                        </div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none">
                                            {item.label}
                                        </span>
                                    </div>
                                    <p className="text-lg font-semibold text-white truncate pl-1">
                                        {item.value}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Face verification status */}
                    <div className="mx-8 sm:mx-12 mb-12 p-6 rounded-2xl bg-gradient-to-br from-blue-600/10 to-indigo-600/10 border border-blue-500/20">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl ${employee.faceVerificationEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                    <ShieldCheck className="w-8 h-8" />
                                </div>
                                <div className="text-center sm:text-left">
                                    <h4 className="text-lg font-bold text-white tracking-tight">Biometric Status</h4>
                                    <p className="text-slate-400 text-sm font-medium">Face recognition is {employee.faceVerificationEnabled ? 'active and verified' : 'not yet configured'}.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`h-3 w-3 rounded-full animate-pulse ${employee.faceVerificationEnabled ? 'bg-emerald-500' : 'bg-slate-500'}`} />
                                <span className="text-sm font-bold text-white uppercase tracking-widest">
                                    {employee.faceVerificationEnabled ? 'System Secure' : 'Setup Required'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
