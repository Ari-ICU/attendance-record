'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import {
    BarChart3,
    TrendingUp,
    Clock,
    Users,
    Calendar,
    Download,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Building2,
    CalendarDays,
    FileSpreadsheet,
    ShieldCheck,
    Check,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    Layers,
    PieChart,
    Activity,
    UserCheck,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { MOCK_DEPARTMENTS, MOCK_EMPLOYEES, MOCK_LEAVE_REQUESTS, MOCK_REPORT_ANALYTICS } from '@/mocks/mockData';

type AnalyticsTab = 'attendance' | 'staff' | 'leave';

export default function AnalyticsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const tabParam = searchParams.get('tab');
    const initialTab: AnalyticsTab = (tabParam === 'staff' || tabParam === 'leave')
        ? tabParam
        : 'attendance';

    const [activeTab, setActiveTab] = useState<AnalyticsTab>(initialTab);
    const [timeRange, setTimeRange] = useState('7d');
    const [selectedDepartment, setSelectedDepartment] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    // Sync tab with URL query parameter
    useEffect(() => {
        if (tabParam && ['attendance', 'staff', 'leave'].includes(tabParam)) {
            setActiveTab(tabParam as AnalyticsTab);
        }
    }, [tabParam]);

    const handleTabChange = (tab: AnalyticsTab) => {
        setActiveTab(tab);
        router.push(`/dashboard/reports/analytics?tab=${tab}`);
    };

    const handleExport = () => {
        setIsExporting(true);
        toast.loading('Generating workforce report...', { id: 'report-export' });
        setTimeout(() => {
            setIsExporting(false);
            toast.success('Workforce intelligence report exported', { id: 'report-export' });
        }, 1000);
    };

    // Filter department breakdown
    const departmentBreakdown = selectedDepartment === 'all'
        ? MOCK_REPORT_ANALYTICS.departmentBreakdown
        : MOCK_REPORT_ANALYTICS.departmentBreakdown.filter(d => d.name === selectedDepartment);

    return (
        <div className="w-full space-y-6 pb-12 font-sans animate-in fade-in duration-300">
            {/* Header Card */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-black text-xs font-bold mb-2">
                        <BarChart3 size={13} />
                        <span>Workforce Intelligence & Reports</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-black tracking-tight">
                        Analytics & Operational Insights
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-black mt-0.5">
                        Deep dive into workforce attendance metrics, department compliance, and leave utilization.
                    </p>
                </div>

                {/* Top Action Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-40">
                        <CustomDropdown
                            value={timeRange}
                            onChange={(val) => setTimeRange(val)}
                            options={[
                                { value: '7d', label: 'Last 7 Days' },
                                { value: '30d', label: 'Last 30 Days' },
                                { value: '90d', label: 'Last Quarter' },
                                { value: '1y', label: 'Fiscal Year 2026' }
                            ]}
                        />
                    </div>

                    <div className="w-48">
                        <CustomDropdown
                            value={selectedDepartment}
                            onChange={(val) => setSelectedDepartment(val)}
                            options={[
                                { value: 'all', label: 'All Departments' },
                                { value: 'Engineering & IT', label: 'Engineering & IT' },
                                { value: 'Product & Design', label: 'Product & Design' },
                                { value: 'Human Resources', label: 'Human Resources' },
                                { value: 'Operations & Facilities', label: 'Operations & Facilities' },
                            ]}
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
                    >
                        <Download size={14} />
                        <span>Export Report</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs Pill Bar */}
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-xs overflow-x-auto">
                <button
                    onClick={() => handleTabChange('attendance')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'attendance'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-black hover:bg-slate-100'
                    }`}
                >
                    <Activity size={16} />
                    <span>Attendance Analytics</span>
                </button>

                <button
                    onClick={() => handleTabChange('staff')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'staff'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-black hover:bg-slate-100'
                    }`}
                >
                    <Users size={16} />
                    <span>Staff & Workforce</span>
                </button>

                <button
                    onClick={() => handleTabChange('leave')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${
                        activeTab === 'leave'
                            ? 'bg-black text-white shadow-xs'
                            : 'text-black hover:bg-slate-100'
                    }`}
                >
                    <CalendarDays size={16} />
                    <span>Leave & Time Off</span>
                </button>
            </div>

            {/* Main Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className="w-full space-y-6"
                >
                    {/* ==================== TAB 1: ATTENDANCE ANALYTICS ==================== */}
                    {activeTab === 'attendance' && (
                        <div className="space-y-6 w-full">
                            {/* KPI Metrics Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">On-Time Arrival Rate</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <TrendingUp size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                            {MOCK_REPORT_ANALYTICS.summary.onTimeRate}%
                                        </span>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                            <ArrowUpRight size={11} /> +2.4%
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Target compliance benchmark: 95.0%</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Workforce Attendance</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                            {MOCK_REPORT_ANALYTICS.summary.avgCompliance}%
                                        </span>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                            94/102 Active
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Overall company presence recorded</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Late Arrival Incidents</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <AlertTriangle size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                            {MOCK_REPORT_ANALYTICS.summary.lateIncidents}
                                        </span>
                                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                                            <ArrowDownRight size={11} /> -3 vs last wk
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Average delay: 11.4 minutes</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Unexcused Absences</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <XCircle size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                            {MOCK_REPORT_ANALYTICS.summary.absentIncidents}
                                        </span>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            1.9% rate
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Excludes pre-approved leave</p>
                                </div>
                            </div>

                            {/* Weekly Trends & Attendance Timeline */}
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                {/* Weekly Attendance Trend Bars */}
                                <div className="lg:col-span-8 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                        <div>
                                            <h3 className="text-sm font-black text-black">Weekly Attendance Distribution</h3>
                                            <p className="text-xs font-medium text-slate-700">Daily breakdown of On-Time vs. Late vs. Absent rates</p>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-black">
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-sm bg-black" /> On-Time
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" /> Late
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> Absent
                                            </span>
                                        </div>
                                    </div>

                                    {/* Bar Rows */}
                                    <div className="space-y-3 pt-2">
                                        {MOCK_REPORT_ANALYTICS.timeline.map((item) => (
                                            <div key={item.day} className="space-y-1">
                                                <div className="flex items-center justify-between text-xs font-bold text-black">
                                                    <span>{item.day}</span>
                                                    <span className="font-mono">{item.onTime}% On-Time</span>
                                                </div>
                                                <div className="w-full h-4 bg-slate-100 rounded-lg overflow-hidden flex">
                                                    <div
                                                        className="h-full bg-black transition-all"
                                                        style={{ width: `${item.onTime}%` }}
                                                        title={`On-Time: ${item.onTime}%`}
                                                    />
                                                    <div
                                                        className="h-full bg-amber-500 transition-all"
                                                        style={{ width: `${item.late}%` }}
                                                        title={`Late: ${item.late}%`}
                                                    />
                                                    <div
                                                        className="h-full bg-rose-500 transition-all"
                                                        style={{ width: `${item.absent}%` }}
                                                        title={`Absent: ${item.absent}%`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Biometric Verification Channel Share */}
                                <div className="lg:col-span-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
                                    <div className="pb-2 border-b border-slate-200">
                                        <h3 className="text-sm font-black text-black">Verification Channels</h3>
                                        <p className="text-xs font-medium text-slate-700">Check-in method usage</p>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                            <div className="flex items-center justify-between text-xs font-bold text-black">
                                                <span className="flex items-center gap-1.5">
                                                    <ShieldCheck size={14} className="text-black" />
                                                    <span>Face Biometrics</span>
                                                </span>
                                                <span className="font-mono font-black">78.4%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-black rounded-full" style={{ width: '78.4%' }} />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                            <div className="flex items-center justify-between text-xs font-bold text-black">
                                                <span className="flex items-center gap-1.5">
                                                    <Sparkles size={14} className="text-black" />
                                                    <span>QR Code / Terminal</span>
                                                </span>
                                                <span className="font-mono font-black">17.2%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-700 rounded-full" style={{ width: '17.2%' }} />
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1">
                                            <div className="flex items-center justify-between text-xs font-bold text-black">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-black" />
                                                    <span>Manual Supervisor Pin</span>
                                                </span>
                                                <span className="font-mono font-black">4.4%</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-400 rounded-full" style={{ width: '4.4%' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Department Performance Breakdown Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-black">Department Attendance Compliance Matrix</h3>
                                        <p className="text-xs font-medium text-slate-700">Team-level attendance rates and headcount participation</p>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-black border border-slate-200 rounded-xl text-xs font-bold">
                                        {departmentBreakdown.length} Departments
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black text-black uppercase tracking-wider">
                                                <th className="py-3 px-5">Department Unit</th>
                                                <th className="py-3 px-5">Headcount</th>
                                                <th className="py-3 px-5">Present Today</th>
                                                <th className="py-3 px-5">Compliance Rate</th>
                                                <th className="py-3 px-5 text-right">Operational Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs">
                                            {departmentBreakdown.map((dept) => (
                                                <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="p-2 rounded-lg bg-slate-100 text-black">
                                                                <Building2 size={15} />
                                                            </div>
                                                            <span className="font-bold text-black text-sm">{dept.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5 font-bold text-black font-mono">
                                                        {dept.total} Staff
                                                    </td>
                                                    <td className="py-3.5 px-5 font-bold text-black font-mono">
                                                        {dept.present} Active
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <div className="flex items-center gap-2.5">
                                                            <span className="font-black text-black font-mono text-sm">{dept.rate}%</span>
                                                            <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                                <div className="h-full bg-black rounded-full" style={{ width: `${dept.rate}%` }} />
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                                                            <Check size={12} />
                                                            <span>Compliant</span>
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB 2: STAFF & WORKFORCE ==================== */}
                    {activeTab === 'staff' && (
                        <div className="space-y-6 w-full">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Total Active Staff</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <Users size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">102</span>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                            100% Retained
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Across 4 corporate business units</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Biometric Registered</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <UserCheck size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">98%</span>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                            100/102 Staff
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">High-accuracy facial descriptors active</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Average Workday Hours</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <Clock size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">8.9 hrs</span>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            Standard: 8.0h
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Includes authorized project overtime</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Operational Units</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <Building2 size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">4</span>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            100% Active
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Engineering, Design, HR, Operations</p>
                                </div>
                            </div>

                            {/* Department Units Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {MOCK_DEPARTMENTS.map((dept) => (
                                    <div key={dept._id} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-black border border-slate-200 text-[10px] font-black uppercase font-mono">
                                                    {dept.code}
                                                </span>
                                                <h3 className="text-base font-black text-black mt-1.5">{dept.name}</h3>
                                            </div>
                                            <span className="text-sm font-black text-black font-mono">
                                                {dept.memberCount} Members
                                            </span>
                                        </div>

                                        <p className="text-xs font-medium text-black">
                                            {dept.description}
                                        </p>

                                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-bold text-black">
                                            <span>Manager: {dept.headOfDepartment?.firstName || 'Lead'} {dept.headOfDepartment?.lastName || 'Manager'}</span>
                                            <span className="text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md text-[11px]">
                                                96% Presence Rate
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ==================== TAB 3: LEAVE & TIME OFF ==================== */}
                    {activeTab === 'leave' && (
                        <div className="space-y-6 w-full">
                            {/* KPI Metrics */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Leave Days Utilized</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <CalendarDays size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">18 Days</span>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            This Month
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Across all company departments</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Pending Approvals</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <Clock size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">2</span>
                                        <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-md">
                                            Requires Review
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Awaiting department manager sign-off</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Approved Requests</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">14</span>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-md">
                                            Processed
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Annual & sick leave submissions</p>
                                </div>

                                <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Avg Request Duration</span>
                                        <div className="p-2 rounded-xl bg-slate-100 text-black border border-slate-200">
                                            <Calendar size={16} />
                                        </div>
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-2xl sm:text-3xl font-black text-black font-mono">2.3 Days</span>
                                        <span className="text-[11px] font-bold text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                            Normal Range
                                        </span>
                                    </div>
                                    <p className="text-[11px] font-medium text-black">Per staff application instance</p>
                                </div>
                            </div>

                            {/* Recent Leave Requests Breakdown Table */}
                            <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
                                <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-black text-black">Recent Leave Submissions & Status Roster</h3>
                                        <p className="text-xs font-medium text-slate-700">Audit trail of submitted staff leave requests</p>
                                    </div>
                                    <span className="px-3 py-1 bg-slate-100 text-black border border-slate-200 rounded-xl text-xs font-bold">
                                        {MOCK_LEAVE_REQUESTS.length} Submissions
                                    </span>
                                </div>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 bg-slate-50/90 text-[11px] font-black text-black uppercase tracking-wider">
                                                <th className="py-3 px-5">Staff Member</th>
                                                <th className="py-3 px-5">Department</th>
                                                <th className="py-3 px-5">Leave Category</th>
                                                <th className="py-3 px-5">Duration & Dates</th>
                                                <th className="py-3 px-5 text-right">Approval Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 text-xs">
                                            {MOCK_LEAVE_REQUESTS.map((req) => (
                                                <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                                                    <td className="py-3.5 px-5 font-bold text-black text-sm">
                                                        {req.employeeName}
                                                    </td>
                                                    <td className="py-3.5 px-5 font-semibold text-black">
                                                        {req.department}
                                                    </td>
                                                    <td className="py-3.5 px-5">
                                                        <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-black font-bold rounded-md text-[11px]">
                                                            {req.type}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-5 font-medium text-black">
                                                        <span className="font-mono font-bold">{req.days} days</span> ({req.startDate} to {req.endDate})
                                                    </td>
                                                    <td className="py-3.5 px-5 text-right">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-[11px] capitalize ${
                                                            req.status === 'approved'
                                                                ? 'bg-emerald-100 text-emerald-800'
                                                                : 'bg-amber-100 text-amber-800'
                                                        }`}>
                                                            {req.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
