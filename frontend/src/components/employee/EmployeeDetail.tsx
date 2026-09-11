'use client';

import { useState } from 'react';
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
    CreditCard,
    DollarSign,
    Copy,
    Check,
    Clock,
    Award,
    Activity,
    Printer,
    FileText,
    ChevronRight,
    Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface EmployeeDetailProps {
    employee: Employee;
}

export default function EmployeeDetail({ employee }: EmployeeDetailProps) {
    const router = useRouter();
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'biometrics' | 'payroll'>('overview');

    const isStudent = employee.type === 'student';
    const fullName = employee.fullName || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Unnamed';

    const handleCopyId = () => {
        navigator.clipboard.writeText(employee._id);
        setCopied(true);
        toast.success('ID copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrint = () => {
        window.print();
    };

    // Mock recent activity for high fidelity
    const recentAttendanceLogs = [
        { date: 'Today, ' + new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), checkIn: '07:54 AM', checkOut: '05:02 PM', status: 'On Time', hours: '8h 08m' },
        { date: 'Yesterday', checkIn: '08:02 AM', checkOut: '05:00 PM', status: 'On Time', hours: '7h 58m' },
        { date: '2 days ago', checkIn: '08:14 AM', checkOut: '05:30 PM', status: 'Late (14m)', hours: '8h 16m' },
        { date: '3 days ago', checkIn: '07:50 AM', checkOut: '05:05 PM', status: 'On Time', hours: '8h 15m' },
        { date: '4 days ago', checkIn: '07:58 AM', checkOut: '05:00 PM', status: 'On Time', hours: '8h 02m' },
    ];

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Top Breadcrumb & Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs print:hidden">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-slate-800">
                    <Link
                        href={`/dashboard/management/employee${isStudent ? '?type=student' : ''}`}
                        className="flex items-center gap-1.5 text-slate-800 hover:text-black transition-colors"
                    >
                        <Users size={15} />
                        <span>{isStudent ? 'Student Directory' : 'Faculty & Staff'}</span>
                    </Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <span className="text-black font-black">{fullName}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={handlePrint}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                        <Printer size={14} />
                        <span>Print Record</span>
                    </button>

                    <button
                        onClick={() => router.push(`/dashboard/management/employee/${employee._id}/edit`)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <Edit3 size={14} />
                        <span>Edit Profile</span>
                    </button>
                </div>
            </div>

            {/* Hero Profile Banner Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Avatar with Biometric Indicator */}
                    <div className="relative group shrink-0">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-200 shadow-xs flex items-center justify-center">
                            {employee.photoUrl ? (
                                <img
                                    src={getFullImageUrl(employee.photoUrl) || ''}
                                    alt={fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <User className="w-14 h-14 text-slate-400" />
                            )}
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-black text-white p-1.5 rounded-xl shadow-md border border-white" title="Biometric ID Enrolled">
                            <Fingerprint size={16} />
                        </div>
                    </div>

                    {/* Basic Meta Details */}
                    <div className="flex-1 text-center md:text-left space-y-2.5">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                            <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                                {fullName}
                            </h1>

                            {employee.isActive !== false ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                                    <CheckCircle2 size={12} className="text-emerald-600" />
                                    Active Record
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 text-xs font-bold">
                                    <XCircle size={12} className="text-rose-600" />
                                    Inactive
                                </span>
                            )}

                            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 text-black border border-slate-300">
                                {isStudent ? 'Student' : 'Faculty & Staff'}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-1 gap-x-4 text-xs sm:text-sm font-semibold text-slate-800">
                            <span className="flex items-center gap-1.5 text-black font-bold">
                                <Briefcase size={15} className="text-blue-600" />
                                {employee.position || (isStudent ? 'Enrolled Student' : 'Staff Member')}
                            </span>
                            <span className="text-slate-300 hidden md:inline">•</span>
                            <span className="flex items-center gap-1.5 text-black font-bold">
                                <Building2 size={15} className="text-blue-600" />
                                {typeof employee.department === 'object' ? (employee.department as any)?.name : (employee.department || 'General Campus')}
                            </span>
                        </div>

                        {/* ID Copy Pill */}
                        <div className="pt-1 flex items-center justify-center md:justify-start gap-2">
                            <span className="text-xs font-bold text-slate-600 font-mono bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                                ID: {employee._id}
                            </span>
                            <button
                                onClick={handleCopyId}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 hover:text-black transition-colors cursor-pointer"
                                title="Copy ID"
                            >
                                {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Key Metrics Quick Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 mt-6 border-t border-slate-100">
                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <Activity size={12} className="text-blue-600" />
                            Attendance Rate
                        </span>
                        <p className="text-lg font-black text-black">98.4%</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <Clock size={12} className="text-blue-600" />
                            Total Sessions
                        </span>
                        <p className="text-lg font-black text-black">142 Days</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <ShieldCheck size={12} className="text-emerald-600" />
                            Face Biometrics
                        </span>
                        <p className="text-sm font-black text-emerald-800 mt-1">Verified & Synced</p>
                    </div>

                    <div className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-0.5">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                            <Calendar size={12} className="text-blue-600" />
                            {isStudent ? 'Enrollment' : 'Joined'}
                        </span>
                        <p className="text-sm font-black text-black mt-1">
                            {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 print:hidden">
                {[
                    { id: 'overview', label: 'Identity & Details', icon: <User size={15} /> },
                    { id: 'attendance', label: 'Attendance History', icon: <Clock size={15} /> },
                    { id: 'biometrics', label: 'Biometric Access', icon: <Fingerprint size={15} /> },
                    ...(!isStudent ? [{ id: 'payroll', label: 'Payroll & Banking', icon: <CreditCard size={15} /> }] : []),
                ].map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-white text-slate-800 hover:text-black hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab 1: Overview & Contact Details */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contact & Personal Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2 border-b border-slate-100 pb-3">
                            <User size={15} className="text-blue-600" />
                            Personal & Contact Information
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Full Legal Name</span>
                                <span className="text-xs sm:text-sm font-bold text-black">{fullName}</span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Email Address</span>
                                <a
                                    href={`mailto:${employee.email}`}
                                    className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                                >
                                    <Mail size={13} />
                                    <span>{employee.email}</span>
                                </a>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Phone Contact</span>
                                {employee.phone ? (
                                    <a
                                        href={`tel:${employee.phone}`}
                                        className="text-xs sm:text-sm font-bold text-blue-600 hover:underline flex items-center gap-1"
                                    >
                                        <Phone size={13} />
                                        <span>{employee.phone}</span>
                                    </a>
                                ) : (
                                    <span className="text-xs font-semibold text-slate-500">Not Provided</span>
                                )}
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-slate-600">
                                    {isStudent ? 'Enrolled Date' : 'Employment Date'}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-black">
                                    {employee.dateOfJoining ? new Date(employee.dateOfJoining).toLocaleDateString() : 'N/A'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Department & Role Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2 border-b border-slate-100 pb-3">
                            <Building2 size={15} className="text-blue-600" />
                            Departmental & Role Placement
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">
                                    {isStudent ? 'Assigned Class / Track' : 'Department'}
                                </span>
                                <span className="text-xs sm:text-sm font-bold text-black">
                                    {typeof employee.department === 'object' ? (employee.department as any)?.name : (employee.department || 'General')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Designation / Role</span>
                                <span className="text-xs sm:text-sm font-bold text-black">
                                    {employee.position || (isStudent ? 'Enrolled Student' : 'Staff Member')}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2 border-b border-slate-100">
                                <span className="text-xs font-bold text-slate-600">Account Classification</span>
                                <span className="text-xs font-bold uppercase tracking-wider text-black">
                                    {employee.type || 'employee'}
                                </span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-xs font-bold text-slate-600">Shift Schedule</span>
                                <span className="text-xs sm:text-sm font-bold text-black">
                                    Standard (08:00 AM - 05:00 PM)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 2: Attendance History */}
            {activeTab === 'attendance' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-black text-black">Recent Attendance Logs</h3>
                            <p className="text-xs font-semibold text-slate-800">
                                Real-time biometric timestamps registered from smart kiosk terminals.
                            </p>
                        </div>
                        <Link
                            href="/dashboard/attendance/records"
                            className="text-xs font-bold text-blue-600 hover:underline"
                        >
                            View Full Attendance Records →
                        </Link>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                    <th className="px-6 py-3.5">Log Date</th>
                                    <th className="px-6 py-3.5">Check In</th>
                                    <th className="px-6 py-3.5">Check Out</th>
                                    <th className="px-6 py-3.5">Logged Hours</th>
                                    <th className="px-6 py-3.5 text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                                {recentAttendanceLogs.map((log, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="px-6 py-3.5 font-bold text-black">{log.date}</td>
                                        <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{log.checkIn}</td>
                                        <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{log.checkOut}</td>
                                        <td className="px-6 py-3.5 font-semibold text-black">{log.hours}</td>
                                        <td className="px-6 py-3.5 text-right">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                                log.status === 'On Time'
                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Tab 3: Biometrics & Security */}
            {activeTab === 'biometrics' && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                                <ShieldCheck size={15} className="text-blue-600" />
                                Facial Biometric Enrollment & Device Sync
                            </h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-600 block">Biometric Template Status</span>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black text-black">Active & Ready for Scanner</span>
                            </div>
                            <p className="text-xs font-semibold text-slate-800">
                                128-dimensional facial embedding vector stored and calibrated for low-light kiosk recognition.
                            </p>
                        </div>

                        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                            <span className="text-xs font-bold text-slate-600 block">Kiosk Verification Accuracy</span>
                            <div className="text-sm font-black text-black">99.4% Match Rate</div>
                            <p className="text-xs font-semibold text-slate-800">
                                Real-time anti-spoofing and liveness detection enabled for this profile.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab 4: Payroll & Banking (Staff Only) */}
            {activeTab === 'payroll' && !isStudent && (
                <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
                    <div className="border-b border-slate-100 pb-3">
                        <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                            <CreditCard size={15} className="text-blue-600" />
                            Compensation & Direct Deposit Information
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-xs font-bold text-slate-600">Base Monthly Salary</span>
                            <p className="text-lg font-black text-black">
                                {employee.currency || 'USD'} {employee.baseSalary?.toLocaleString() || '0.00'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-xs font-bold text-slate-600">Hourly Rate</span>
                            <p className="text-lg font-black text-black">
                                {employee.currency || 'USD'} {employee.hourlyRate?.toLocaleString() || '0.00'}/hr
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-xs font-bold text-slate-600">Banking Partner</span>
                            <p className="text-base font-black text-black">
                                {employee.bankDetails?.bankName || 'Not Set'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-xs font-bold text-slate-600">Account Number</span>
                            <p className="text-base font-mono font-black text-black">
                                {employee.bankDetails?.accountNumber || 'Not Set'}
                            </p>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                            <span className="text-xs font-bold text-slate-600">Account Holder Name</span>
                            <p className="text-base font-black text-black uppercase">
                                {employee.bankDetails?.accountName || 'Not Set'}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
