'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
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
    ShieldCheck,
    Users,
    Crown,
    UserCheck,
    ChevronRight,
    ArrowUpRight,
    Sparkles
} from 'lucide-react';
import { getFullImageUrl } from '@/utils/url.utils';
import { EmployeeService } from '@/services/employee.service';
import { DepartmentService } from '@/services/department.service';
import { Employee } from '@/types/employee.types';
import { Department } from '@/types/department.types';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [employeeData, setEmployeeData] = useState<Employee | null>(null);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);

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

            // Fetch linked employee record, all employees, and departments
            Promise.all([
                EmployeeService.getAllEmployees({ limit: 100 }),
                DepartmentService.getAll()
            ])
                .then(([empRes, deptRes]) => {
                    const emps = empRes?.employees || [];
                    setAllEmployees(emps);
                    setDepartments(deptRes?.data || []);

                    if (emps.length > 0) {
                        const selfEmp = emps.find(e => e.email?.toLowerCase() === user.email?.toLowerCase()) || emps[0];
                        if (selfEmp) {
                            setEmployeeData(selfEmp);
                        }
                    }
                })
                .catch((err) => {
                    console.warn('Could not load linked records', err);
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

    const deptName = typeof employeeData?.department === 'object'
        ? (employeeData?.department as any)?.name
        : (employeeData?.department || formData.department || user?.department || 'General');

    const positionTitle = employeeData?.position || formData.position || user?.position || 'Staff Member';

    // Find current user's department object
    const currentDept = departments.find(
        d => d.name?.toLowerCase() === deptName?.toLowerCase()
    );

    // Resolve team leader / manager for this department
    const teamLeader = currentDept?.head && typeof currentDept.head === 'object'
        ? currentDept.head as any
        : (currentDept?.headOfDepartment ? {
            firstName: currentDept.headOfDepartment.firstName,
            lastName: currentDept.headOfDepartment.lastName,
            position: 'Department Team Leader',
            email: 'lead@staffflow.io',
            phone: '+855 096 777 999'
        } : null);

    // Check if current user is the team leader / manager
    const isUserTeamLead = Boolean(
        user?.role === 'manager' ||
        user?.role === 'admin' ||
        /lead|manager|head|director|supervisor/i.test(positionTitle) ||
        (teamLeader && (
            teamLeader.email?.toLowerCase() === user?.email?.toLowerCase() ||
            (teamLeader._id && (employeeData?._id === teamLeader._id || employeeData?.id === teamLeader._id))
        ))
    );

    // Find all team members in this department (child team)
    const childTeamMembers = allEmployees.filter(
        e => {
            const empDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
            return empDept?.toLowerCase() === deptName?.toLowerCase();
        }
    );

    const stats = [
        { label: 'Attendance Rate', value: '98.5%', icon: CheckCircle2, color: 'text-emerald-700', bg: 'bg-emerald-50' },
        { label: 'Logged Hours', value: '164 hrs', icon: Clock, color: 'text-black', bg: 'bg-slate-100' },
        { label: 'Biometrics', value: employeeData?.faceDescriptor?.length ? 'Registered' : 'Active', icon: ShieldCheck, color: 'text-blue-800', bg: 'bg-blue-50' },
    ];

    return (
        <div className="w-full space-y-6 pb-12 font-sans">
            {/* Profile Card Banner */}
            <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
                <div className="h-32 sm:h-36 bg-black relative">
                    <div className="absolute top-3 right-4 flex items-center gap-2">
                        {isUserTeamLead ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400 text-black text-xs font-black shadow-sm">
                                <Crown size={13} />
                                <span>Team Leader / Head of Dept</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold border border-white/30">
                                <Building2 size={13} />
                                <span>{deptName} Team</span>
                            </span>
                        )}
                    </div>
                </div>

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
                                        <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight flex items-center gap-2">
                                            <span>{formData.firstName} {formData.lastName}</span>
                                            {isUserTeamLead && <Crown size={18} className="text-amber-500 fill-amber-500" />}
                                        </h1>
                                    )}
                                    <span className="px-2.5 py-0.5 rounded-full bg-black text-white text-xs font-bold capitalize">
                                        {user?.role || 'Employee'}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black pt-0.5">
                                    <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                        <Briefcase size={14} className="text-black" />
                                        <span>Position: {positionTitle}</span>
                                    </span>
                                    <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                                        <Building2 size={14} className="text-black" />
                                        <span>Department: {deptName}</span>
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

            {/* Department Leadership & Hierarchy Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* 1. Department Team Leader Card */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Crown size={16} className="text-amber-500" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-black">
                                Department Team Leader / Manager
                            </h3>
                        </div>
                        <span className="text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full">
                            {deptName}
                        </span>
                    </div>

                    {teamLeader ? (
                        <div className="flex items-center gap-3.5 pt-1">
                            <div className="w-12 h-12 rounded-xl bg-black text-white font-black flex items-center justify-center text-sm shrink-0 shadow-xs overflow-hidden">
                                {teamLeader.photoUrl ? (
                                    <img src={getFullImageUrl(teamLeader.photoUrl)} alt="Leader" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{teamLeader.firstName?.[0] || 'L'}{teamLeader.lastName?.[0] || 'D'}</span>
                                )}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-black text-black truncate flex items-center gap-1.5">
                                    <span>{teamLeader.firstName} {teamLeader.lastName}</span>
                                    {isUserTeamLead && (
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">(You)</span>
                                    )}
                                </h4>
                                <p className="text-xs font-semibold text-slate-700 truncate">
                                    {teamLeader.position || 'Head of Department / Team Leader'}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-2">
                                    <span>📧 {teamLeader.email || 'lead@staffflow.io'}</span>
                                    {teamLeader.phone && <span>📞 {teamLeader.phone}</span>}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="py-2 text-xs font-semibold text-slate-600">
                            {isUserTeamLead
                                ? `You are assigned as the Team Leader for ${deptName}.`
                                : `Department Team Leader assigned: General Management Team.`}
                        </div>
                    )}
                </div>

                {/* 2. Department & Child Team Quick Info */}
                <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                            <Users size={16} className="text-blue-600" />
                            <h3 className="text-xs font-black uppercase tracking-wider text-black">
                                Department & Child Team Structure
                            </h3>
                        </div>
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full">
                            {childTeamMembers.length} Team Members
                        </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div>
                            <span className="text-xs font-bold text-slate-600 block">Department Unit:</span>
                            <span className="text-base font-black text-black">{deptName}</span>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                                My Role: <strong className="text-black font-bold">{positionTitle}</strong>
                            </span>
                        </div>

                        <Link
                            href="/dashboard/management/departments"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-black hover:text-white text-black text-xs font-bold rounded-xl transition-all border border-slate-200"
                        >
                            <span>View All Teams</span>
                            <ArrowUpRight size={13} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Child Team Members / Department Personnel Roster */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                        <h3 className="text-base font-black text-black flex items-center gap-2">
                            <Users size={18} className="text-black" />
                            <span>
                                {isUserTeamLead ? `My Department Team Members (${deptName})` : `${deptName} Team Members & Colleagues`}
                            </span>
                        </h3>
                        <p className="text-xs font-semibold text-slate-700 mt-0.5">
                            {isUserTeamLead
                                ? 'Personnel, positions, and biometric attendance roster under your leadership.'
                                : 'Assigned colleagues, team leads, and peers within your department.'}
                        </p>
                    </div>

                    <span className="px-3 py-1 bg-slate-100 text-black border border-slate-300 rounded-lg text-xs font-bold self-start sm:self-auto">
                        {childTeamMembers.length} Total Staff in {deptName}
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-4">Member Name</th>
                                <th className="py-3 px-4">Position / Role</th>
                                <th className="py-3 px-4">Contact</th>
                                <th className="py-3 px-4">Biometrics</th>
                                <th className="py-3 px-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {childTeamMembers.length > 0 ? (
                                childTeamMembers.map((member) => {
                                    const isSelf = member.email?.toLowerCase() === user?.email?.toLowerCase();
                                    return (
                                        <tr key={member._id || member.id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs overflow-hidden shrink-0">
                                                        {member.photoUrl ? (
                                                            <img src={getFullImageUrl(member.photoUrl)} alt={member.firstName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <span>{member.firstName?.[0]}{member.lastName?.[0]}</span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-black block">
                                                            {member.firstName} {member.lastName}
                                                            {isSelf && <span className="ml-1.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold border border-emerald-200">You</span>}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500">{member.type || 'Staff'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className="font-bold text-black bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                                                    {member.position || 'Staff Member'}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4">
                                                <div className="space-y-0.5 text-[11px] font-semibold text-black">
                                                    <div className="flex items-center gap-1"><Mail size={11} className="text-slate-500" /> {member.email}</div>
                                                    <div className="flex items-center gap-1"><Phone size={11} className="text-slate-500" /> {member.phone}</div>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                                    member.faceVerificationEnabled || member.faceDescriptor?.length
                                                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                        : 'bg-slate-100 text-black border border-slate-200'
                                                }`}>
                                                    <UserCheck size={11} />
                                                    <span>{member.faceVerificationEnabled || member.faceDescriptor?.length ? 'Enrolled' : 'Pending'}</span>
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <Link
                                                    href={`/dashboard/management/employee/${member._id || member.id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg text-[11px] transition-colors inline-block"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="py-8 text-center text-slate-600 font-bold">
                                        No team members found in {deptName}.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Compensation & Personal Details Section */}
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

