'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
    Mail,
    MapPin,
    Phone,
    Briefcase,
    Camera,
    CheckCircle2,
    Clock,
    Award,
    Save,
    X,
    Loader2,
    DollarSign,
    Building2,
    Calendar,
    CreditCard,
    ShieldCheck
} from 'lucide-react';
import { getFullImageUrl } from '@/utils/url.utils';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        position: '',
        department: '',
        phoneNumber: '',
        bio: '',
        location: 'Phnom Penh, KH'
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                position: user.position || 'Staff Member',
                department: user.department || 'General',
                phoneNumber: user.phoneNumber || '+855 096 888 888',
                bio: user.bio || 'Employee member at StaffFlow.',
                location: user.location || 'Phnom Penh, KH'
            });

            // Fetch linked employee record for compensation & banking info
            EmployeeService.getAllEmployees()
                .then((res) => {
                    if (res.employees && res.employees.length > 0) {
                        const selfEmp = res.employees.find(e => e.email?.toLowerCase() === user.email?.toLowerCase()) || res.employees[0];
                        if (selfEmp) {
                            setEmployeeData(selfEmp);
                        }
                    }
                })
                .catch((err) => {
                    console.warn('Could not load linked employee record', err);
                });
        }
    }, [user]);

    const handleSave = async () => {
        setLoading(true);
        try {
            await updateProfile(formData);
            toast.success('Profile updated successfully');
            setIsEditing(false);
        } catch {
            toast.error('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Attendance Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        { label: 'Logged Hours', value: '164 hrs', icon: Clock, color: 'text-black', bg: 'bg-slate-100' },
        { label: 'Biometrics', value: employeeData?.faceDescriptor?.length ? 'Registered' : 'Active', icon: ShieldCheck, color: 'text-blue-800', bg: 'bg-blue-50' },
    ];

    const deptName = typeof employeeData?.department === 'object' ? (employeeData?.department as any)?.name : (employeeData?.department || formData.department);
    const positionTitle = employeeData?.position || formData.position;

    return (
        <div className="w-full space-y-6 pb-12">
            {/* Profile Card Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="h-32 sm:h-36 bg-black relative" />

                <div className="px-5 sm:px-8 pb-6 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative group/avatar">
                                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white overflow-hidden bg-slate-100 shadow-md flex items-center justify-center">
                                    {user?.photoUrl || employeeData?.photoUrl ? (
                                        <img src={getFullImageUrl(user?.photoUrl || employeeData?.photoUrl || '') || ''} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-2xl font-black text-black">
                                            {formData.firstName?.[0] || 'A'}{formData.lastName?.[0] || ''}
                                        </span>
                                    )}
                                </div>
                                <button className="absolute bottom-1 right-1 p-2 rounded-xl bg-black text-white shadow-xs hover:bg-slate-800 transition-colors cursor-pointer">
                                    <Camera size={13} />
                                </button>
                            </div>

                            {/* Name & Role */}
                            <div className="space-y-1">
                                <div className="flex items-center flex-wrap gap-2.5">
                                    {isEditing ? (
                                        <div className="flex flex-wrap gap-2">
                                            <input
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-sm sm:text-base font-bold text-black outline-none focus:bg-white focus:border-black w-28 sm:w-36"
                                                placeholder="First Name"
                                            />
                                            <input
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1 text-sm sm:text-base font-bold text-black outline-none focus:bg-white focus:border-black w-28 sm:w-36"
                                                placeholder="Last Name"
                                            />
                                        </div>
                                    ) : (
                                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                            {formData.firstName} {formData.lastName}
                                        </h1>
                                    )}
                                    <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold capitalize">
                                        {user?.role || 'Employee'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black pt-0.5">
                                    <span className="flex items-center gap-1.5">
                                        <Briefcase size={14} className="text-black" />
                                        <span>{positionTitle}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Building2 size={14} className="text-black" />
                                        <span>{deptName}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <MapPin size={14} className="text-black" />
                                        <span>{formData.location}</span>
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Edit / Save Action */}
                        <div className="flex items-center gap-2">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black font-bold transition-colors cursor-pointer"
                                        title="Cancel"
                                    >
                                        <X size={15} />
                                    </button>
                                    <button
                                        disabled={loading}
                                        onClick={handleSave}
                                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                                        <span>Save Changes</span>
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors shadow-xs cursor-pointer"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Compensation & Personal Details Section (Employee View) */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-2">
                        <DollarSign size={15} className="text-emerald-600" />
                        My Compensation & Banking Details
                    </h3>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Active Contract
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Base Monthly Salary</span>
                        <span className="text-xl font-black font-mono text-black mt-1 block">
                            ${(employeeData?.baseSalary ?? 2800).toLocaleString()} USD
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Standard monthly baseline</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Overtime Base Rate</span>
                        <span className="text-xl font-black font-mono text-black mt-1 block">
                            ${(employeeData?.hourlyRate ?? 17.50).toFixed(2)} / hr
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5 block">Calculated at standard rate</span>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Bank Account</span>
                        <span className="text-sm font-bold text-black mt-1 block">
                            {employeeData?.bankDetails?.bankName || 'ABA Bank'}
                        </span>
                        <span className="text-xs font-mono text-slate-700 mt-0.5 block">
                            A/C: {employeeData?.bankDetails?.accountNumber || '001 234 567'}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Quick Stats & Contacts */}
                <div className="space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider mb-4">Summary Statistics</h3>
                        <div className="space-y-3">
                            {stats.map((stat, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                            <stat.icon size={15} />
                                        </div>
                                        <span className="text-xs font-bold text-black">{stat.label}</span>
                                    </div>
                                    <span className="text-sm font-black text-black">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider">Contact Credentials</h3>
                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-black">Email Address</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-black">
                                    <Mail size={14} className="text-black" />
                                    <span className="truncate">{user?.email || 'user@staffflow.io'}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-black">Phone Number</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-black">
                                    <Phone size={14} className="text-black" />
                                    <span>{formData.phoneNumber}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-black">Department Track</label>
                                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-black">
                                    <Briefcase size={14} className="text-black" />
                                    <span>{deptName}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Bio */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-7 shadow-xs space-y-4">
                        <h2 className="text-base font-black text-black pb-3 border-b border-slate-200">
                            About & Professional Summary
                        </h2>

                        {isEditing ? (
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows={5}
                                className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-300 text-black font-medium text-xs sm:text-sm outline-none focus:bg-white focus:border-black transition-colors resize-none placeholder:text-slate-500"
                            />
                        ) : (
                            <p className="text-black font-medium text-xs sm:text-sm leading-relaxed">
                                {formData.bio}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

