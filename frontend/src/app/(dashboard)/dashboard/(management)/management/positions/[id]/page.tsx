'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft,
    Building2,
    Users,
    ShieldCheck,
    Edit2,
    Trash2,
    Briefcase,
    DollarSign,
    Clock,
    MapPin,
    CheckCircle2,
    Sparkles,
    UserPlus,
    FileText,
    ExternalLink,
    Award,
    Layers,
    BadgeAlert
} from 'lucide-react';
import { PositionItem } from '@/types/position.types';
import { PositionService } from '@/services/position.service';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import toast from 'react-hot-toast';

// Helper to resolve role specifications directly from backend position data
function getBlueprint(pos: PositionItem) {
    const level = pos.level || 'Mid-Level';
    const dept = pos.department || 'the designated department';

    return {
        summary: pos.description && pos.description.trim().length > 0
            ? pos.description.trim()
            : `Core organizational role responsible for operational directives, daily project delivery, and cross-functional team collaboration within ${dept}.`,
        responsibilities: pos.responsibilities && pos.responsibilities.length > 0
            ? pos.responsibilities
            : [
                `Execute core duties and daily operational milestones in accordance with department standards.`,
                `Collaborate with cross-functional team members to maintain high quality and timely deliverable output.`,
                `Ensure compliance with company attendance, security, and data protection policies.`,
                `Participate in team planning sessions, sprint reviews, and continuous improvement retrospectives.`,
                `Maintain clear documentation and technical/operational status updates for management reporting.`
            ],
        skills: pos.skills && pos.skills.length > 0
            ? pos.skills
            : ['Team Collaboration', 'Problem Solving', 'Communication', 'Project Execution', 'Quality Assurance'],
        salaryRange: pos.salaryRange || (level === 'Executive' ? '$3,000 – $6,000 / mo' : level === 'Senior' || level === 'Lead' ? '$1,800 – $3,500 / mo' : level === 'Junior' ? '$600 – $1,200 / mo' : '$1,000 – $2,200 / mo'),
        employmentType: pos.employmentType || 'Full-time / Permanent',
        experienceReq: pos.experienceReq || (level === 'Executive' ? '7+ Years' : level === 'Senior' ? '4 – 7 Years' : level === 'Junior' ? '0 – 2 Years' : '2 – 4 Years'),
        workPolicy: pos.workPolicy || 'Hybrid (3 days on-site)',
        workingHours: pos.workingHours || '08:00 – 17:00 (Mon–Fri)',
    };
}

export default function PositionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [pos, setPos] = useState<PositionItem | null>(null);
    const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                let currentPos: PositionItem | null = null;
                const data = await PositionService.getById(id);
                if (data) {
                    currentPos = data;
                } else {
                    const all = await PositionService.getAll();
                    const found = all.find(p => p.id === id || p._id === id);
                    if (found) currentPos = found;
                }
                setPos(currentPos);

                // Fetch employees to find assigned team members
                try {
                    const empRes = await EmployeeService.getAllEmployees({ limit: 100 });
                    const list = empRes.employees || [];
                    if (currentPos) {
                        const targetTitle = currentPos.title.toLowerCase().trim();
                        const matching = list.filter(e => {
                            const empPos = (e.position || '').toLowerCase().trim();
                            return empPos === targetTitle || (targetTitle.includes(empPos) && empPos.length > 2);
                        });
                        setAssignedEmployees(matching);
                    }
                } catch (empErr) {
                    console.warn('Failed to load assigned employees:', empErr);
                }
            } catch {
                toast.error('Failed to load position');
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id]);

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this position?')) return;
        try {
            await PositionService.delete(id);
            toast.success('Position deleted');
            router.push('/dashboard/management/positions');
        } catch {
            toast.error('Failed to delete position');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!pos) {
        return (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
                <p className="text-sm font-bold text-black">Position not found.</p>
                <Link href="/dashboard/management/positions" className="mt-4 inline-block px-4 py-2 bg-black text-white rounded-xl text-xs font-bold">
                    Back to Positions
                </Link>
            </div>
        );
    }

    const blueprint = getBlueprint(pos);
    const activeStaffCount = assignedEmployees.length || pos.employeeCount || 0;

    return (
        <div className="w-full space-y-6 pb-16 font-sans">
            {/* Top Navigation & Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="flex items-center gap-3.5">
                    <Link
                        href="/dashboard/management/positions"
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors"
                        title="Back to Positions List"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <div className="flex items-center gap-2.5 flex-wrap">
                            <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                                {pos.title}
                            </h1>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold">
                                {pos.department}
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
                                Tier: {pos.level}
                            </span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-slate-600 mt-1">
                            Organizational Job Profile & Position Specifications
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <Link
                        href={`/dashboard/management/positions/${id}/edit`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl shadow-xs transition-all text-xs sm:text-sm font-bold cursor-pointer"
                    >
                        <Edit2 size={15} />
                        <span>Edit Position</span>
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs cursor-pointer"
                        title="Delete Position"
                    >
                        <Trash2 size={15} />
                    </button>
                </div>
            </div>

            {/* Metrics Overview Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Department</span>
                        <Building2 size={18} className="text-slate-800" />
                    </div>
                    <div className="text-base font-black text-black">{pos.department}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Primary Operational Unit</div>
                </div>

                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Seniority Track</span>
                        <ShieldCheck size={18} className="text-blue-700" />
                    </div>
                    <div className="text-base font-black text-blue-900">{pos.level}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Req. Exp: {blueprint.experienceReq}</div>
                </div>

                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Active Headcount</span>
                        <Users size={18} className="text-emerald-700" />
                    </div>
                    <div className="text-base font-black text-black flex items-center gap-1.5">
                        <span>{activeStaffCount}</span>
                        <span className="text-xs font-bold text-slate-500">Staff Assigned</span>
                    </div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">Active in workforce roster</div>
                </div>

                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Salary Band</span>
                        <DollarSign size={18} className="text-amber-700" />
                    </div>
                    <div className="text-base font-black text-black">{blueprint.salaryRange}</div>
                    <div className="text-xs font-medium text-slate-500 mt-0.5">{blueprint.employmentType}</div>
                </div>
            </div>

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Columns: Full Job Description & Core Duties */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Role Overview */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <FileText size={18} className="text-black" />
                            <h2 className="text-base font-black text-black">Role Overview & Executive Summary</h2>
                        </div>
                        <p className="text-sm font-medium text-slate-800 leading-relaxed">
                            {blueprint.summary}
                        </p>
                    </div>

                    {/* Key Responsibilities */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Layers size={18} className="text-black" />
                                <h2 className="text-base font-black text-black">Core Responsibilities & Deliverables</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-500">{blueprint.responsibilities.length} Key Duties</span>
                        </div>

                        <div className="space-y-3">
                            {blueprint.responsibilities.map((resp, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                                    <CheckCircle2 size={16} className="text-emerald-700 mt-0.5 shrink-0" />
                                    <span className="text-xs sm:text-sm font-medium text-slate-900 leading-normal">
                                        {resp}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Required Skills & Competencies */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                            <Award size={18} className="text-black" />
                            <h2 className="text-base font-black text-black">Required Technical Competencies & Tooling</h2>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {blueprint.skills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-900 transition-colors"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Work Policy & Assigned Staff Roster */}
                <div className="space-y-6">
                    {/* Employment & Shift Details */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                        <h2 className="text-sm font-black text-black uppercase tracking-wider">Working Conditions</h2>
                        <div className="space-y-3 text-xs font-medium text-slate-800">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Clock size={14} />
                                    <span>Standard Hours:</span>
                                </div>
                                <span className="font-bold text-black">08:00 – 17:00 (Mon–Fri)</span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <MapPin size={14} />
                                    <span>Workplace Policy:</span>
                                </div>
                                <span className="font-bold text-black">{blueprint.workPolicy}</span>
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <Briefcase size={14} />
                                    <span>Contract Type:</span>
                                </div>
                                <span className="font-bold text-black">{blueprint.employmentType}</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <ShieldCheck size={14} />
                                    <span>Biometric Logging:</span>
                                </div>
                                <span className="font-bold text-emerald-800">Required (Kiosk / App)</span>
                            </div>
                        </div>
                    </div>

                    {/* Assigned Employees Roster */}
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Users size={16} className="text-black" />
                                <h2 className="text-sm font-black text-black">Assigned Team Members</h2>
                            </div>
                            <span className="text-xs font-bold text-slate-500">
                                {assignedEmployees.length}
                            </span>
                        </div>

                        {assignedEmployees.length > 0 ? (
                            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                                {assignedEmployees.map(emp => (
                                    <div
                                        key={emp._id || emp.id}
                                        className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between hover:bg-slate-100/80 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {emp.photoUrl ? (
                                                <img
                                                    src={emp.photoUrl}
                                                    alt={emp.firstName}
                                                    className="w-9 h-9 rounded-xl object-cover border border-slate-200"
                                                />
                                            ) : (
                                                <div className="w-9 h-9 rounded-xl bg-black text-white font-black text-xs flex items-center justify-center shrink-0">
                                                    {emp.firstName?.[0]}{emp.lastName?.[0]}
                                                </div>
                                            )}
                                            <div className="min-w-0">
                                                <div className="text-xs font-bold text-black truncate">
                                                    {emp.firstName} {emp.lastName}
                                                </div>
                                                <div className="text-[11px] font-medium text-slate-500 truncate">
                                                    {emp.email}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/dashboard/management/employee/${emp._id || emp.id}`}
                                            className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-200 text-black transition-colors shrink-0 ml-2"
                                            title="View Staff Profile"
                                        >
                                            <ExternalLink size={13} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 px-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl space-y-2">
                                <p className="text-xs font-medium text-slate-600">No staff currently designated with this title.</p>
                                <Link
                                    href="/dashboard/management/employee/create"
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                                >
                                    <UserPlus size={13} />
                                    <span>Add Staff Member</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

