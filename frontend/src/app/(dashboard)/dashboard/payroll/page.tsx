'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    DollarSign,
    Receipt,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar,
    Users,
    Building2,
    TrendingUp,
    Printer,
    FileSpreadsheet,
    Eye,
    Filter,
    Search,
    RefreshCw,
    ShieldCheck,
    Check,
    X,
    CreditCard,
    ArrowUpRight,
    Sparkles,
    CalendarDays,
    Timer,
    AlertTriangle,
    FileCheck,
    HelpCircle,
    Calculator,
    ChevronRight,
    UserCheck,
    Info
} from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';
import { Payslip, MonthlyPayrollSummary, PaymentStatus } from '@/types/payroll.types';
import CustomDropdown from '@/components/ui/CustomDropdown';

export default function PayrollManagementPage() {
    const [summary, setSummary] = useState<MonthlyPayrollSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState('September');
    const [selectedYear, setSelectedYear] = useState('2026');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'attendance' | 'financial'>('attendance');
    const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);

    const loadPayroll = useCallback(async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            else setRefreshing(true);

            const data = await PayrollService.getMonthlyPayroll(selectedMonth, parseInt(selectedYear));
            setSummary(data);
        } catch (err) {
            console.error('Failed to load payroll summary', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedMonth, selectedYear]);

    useEffect(() => {
        loadPayroll();
    }, [loadPayroll]);

    // Mark single payslip status
    const handleToggleStatus = async (id: string, currentStatus: PaymentStatus) => {
        const nextStatus: PaymentStatus = currentStatus === 'paid' ? 'pending' : 'paid';
        await PayrollService.updatePayslipStatus(id, nextStatus);
        loadPayroll(true);
    };

    // Mark all as paid
    const handleMarkAllPaid = async () => {
        await PayrollService.markAllAsPaid(selectedMonth, parseInt(selectedYear));
        loadPayroll(true);
    };

    // Re-run payroll calculation from attendance records
    const handleRunPayroll = async () => {
        setRefreshing(true);
        const res = await PayrollService.generatePayrollRun(selectedMonth, parseInt(selectedYear));
        setSummary(res);
        setRefreshing(false);
    };

    // Export CSV with full attendance & calculation breakdown
    const handleExportCSV = () => {
        if (!summary) return;
        const headers = 'Employee,Department,Position,Base Rate,Worked Hours,Target Hours,OT Hours,OT Pay,Late Days,Late Penalty,Leave Days,Permission Days,Absent Days,Absent Deductions,Gross Pay,Total Deductions,Net Pay,Status,Bank\n';
        const rows = summary.payslips.map(p => {
            const empName = `${p.employee?.firstName} ${p.employee?.lastName}`;
            const dept = typeof p.employee?.department === 'object' ? (p.employee.department as any)?.name : p.employee?.department || 'General';
            const workedH = p.earnings.workedHours || p.attendanceMetrics?.totalWorkingHours || 160;
            const targetH = p.earnings.targetDays ? p.earnings.targetDays * 8 : 176;
            const otH = p.earnings.overtimeHours || 0;
            const otPay = p.earnings.overtimePay || 0;
            const lateD = p.deductions.lateCount || p.attendanceMetrics?.lateDays || 0;
            const latePen = p.deductions.lateDeductions || 0;
            const leaveD = p.deductions.leaveDays || 0;
            const permD = p.deductions.permissionDays || 0;
            const absentD = p.deductions.absentDays || 0;
            const absentDed = p.deductions.absentDeductions || 0;
            return `"${empName}","${dept}","${p.employee?.position || 'Staff'}",${p.earnings.baseSalary},${workedH},${targetH},${otH},${otPay},${lateD},${latePen},${leaveD},${permD},${absentD},${absentDed},${p.earnings.grossEarnings},${p.deductions.totalDeductions},${p.netPay},"${p.status}","${p.bankDetails?.bankName} - ${p.bankDetails?.accountNumber}"`;
        }).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Attendance_Payroll_Calculation_${selectedMonth}_${selectedYear}.csv`;
        a.click();
    };

    // Filter payslips
    const filteredPayslips = (summary?.payslips || []).filter(p => {
        const empName = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase();
        const dept = (typeof p.employee?.department === 'object' ? (p.employee.department as any)?.name : p.employee?.department || '').toLowerCase();
        const matchesSearch = empName.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || dept.includes(departmentFilter.toLowerCase());
        
        let matchesStatus = true;
        if (statusFilter === 'ot') matchesStatus = (p.earnings.overtimeHours || 0) > 0;
        else if (statusFilter === 'late') matchesStatus = (p.deductions.lateCount || p.attendanceMetrics?.lateDays || 0) > 0;
        else if (statusFilter === 'leave') matchesStatus = (p.deductions.leaveDays || 0) > 0 || (p.deductions.permissionDays || 0) > 0;
        else if (statusFilter === 'absent') matchesStatus = (p.deductions.absentDays || 0) > 0;
        else if (statusFilter === 'paid') matchesStatus = p.status === 'paid';
        else if (statusFilter === 'pending') matchesStatus = p.status === 'pending';

        return matchesSearch && matchesDept && matchesStatus;
    });

    const monthOptions = [
        { value: 'September', label: 'September 2026 (Current)' },
        { value: 'August', label: 'August 2026' },
        { value: 'July', label: 'July 2026' },
    ];

    const departmentOptions = [
        { value: 'all', label: 'All Departments' },
        { value: 'engineering', label: 'Engineering & IT' },
        { value: 'product', label: 'Product & Design' },
        { value: 'human resources', label: 'Human Resources' },
        { value: 'operations', label: 'Operations & Facilities' },
    ];

    const statusFilterOptions = [
        { value: 'all', label: 'All Attendance Conditions' },
        { value: 'ot', label: 'With Overtime (OT)' },
        { value: 'late', label: 'With Late Check-ins' },
        { value: 'leave', label: 'With Leave / Permission' },
        { value: 'absent', label: 'With Absent Deductions' },
        { value: 'paid', label: 'Status: Paid Only' },
        { value: 'pending', label: 'Status: Pending Only' },
    ];

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-16 font-sans max-w-full overflow-x-hidden">
            {/* Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-[11px] sm:text-xs font-black border border-blue-200">
                                <Calculator size={13} className="text-blue-600" />
                                <span>ATTENDANCE-DRIVEN PAYROLL ENGINE</span>
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-1 rounded-full">
                                {selectedMonth} {selectedYear}
                            </span>
                            <span className="text-[11px] sm:text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 sm:px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                Timesheets Active
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-3xl font-black text-black tracking-tight">
                            Workforce Timesheet & Payroll Calculation
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-3xl leading-relaxed">
                            Dynamic salary calculation calculated strictly from tracked working time, approved overtime (OT), late penalties, leave allowances, permissions, and absent deductions.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            onClick={handleRunPayroll}
                            disabled={refreshing}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                            title="Recalculate monthly salary from actual attendance records"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span>Recalculate Timesheets</span>
                        </button>

                        <button
                            onClick={handleMarkAllPaid}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 size={14} />
                            <span>Disburse All</span>
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-white hover:bg-slate-100 text-black border border-slate-300 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                            title="Export Detailed Timesheet & Bank CSV"
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Export Timesheet CSV</span>
                        </button>

                        <button
                            onClick={() => loadPayroll(false)}
                            disabled={refreshing}
                            className={`p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-black hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer ${
                                refreshing ? 'animate-spin text-black' : ''
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Attendance Calculation KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
                {/* 1. Working Time Clocked */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Total Working Time</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                {summary?.totalWorkingHours ? summary.totalWorkingHours.toLocaleString() : '960'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">Hours Clocked</span>
                        </div>
                        <p className="text-xs font-bold text-blue-900 mt-2 flex items-center gap-1">
                            <UserCheck size={13} className="text-blue-600" />
                            <span>Across {summary?.totalStaffCount || 6} active staff members</span>
                        </p>
                    </div>
                </div>

                {/* 2. Overtime (OT) Logged */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Overtime (OT) Pay</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <TrendingUp size={16} />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                +${summary?.totalOvertimePay ? summary.totalOvertimePay.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-amber-900">USD</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-1">
                            <span>{summary?.totalOvertimeHours || 30.5} OT hours @ 1.5x Rate</span>
                        </p>
                    </div>
                </div>

                {/* 3. Penalties: Late & Absent */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Late & Absent Deductions</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-rose-700 font-mono">
                                -${(((summary?.totalLateDeductions || 0) + (summary?.totalAbsentDeductions || 0))).toFixed(2)}
                            </span>
                            <span className="text-xs font-bold text-rose-900">Deducted</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2 flex items-center gap-2">
                            <span>{summary?.totalLateCount || 0} Late Check-ins</span>
                            <span>·</span>
                            <span>{summary?.totalAbsentDays || 0} Absent Days</span>
                        </p>
                    </div>
                </div>

                {/* 4. Total Net Calculated Payout */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Calculated Net Payout</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div className="mt-3 sm:mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl sm:text-3xl font-black text-black font-mono">
                                ${summary?.totalNetPayout ? summary.totalNetPayout.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">USD</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-800 mt-2 flex items-center gap-1">
                            <span>After attendance adjustments & taxes</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* View Switcher & Formula Explanation Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center font-bold shrink-0">
                        <Calculator size={18} />
                    </div>
                    <div>
                        <div className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-2">
                            <span>Active Calculation Formula</span>
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-700 font-bold">Live</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                            <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono font-bold text-black">
                                Net Pay = (Base Salary − Absent & Unpaid Deductions) + Overtime Pay (1.5x) − Late Penalties + Allowances − Tax (5%) & Social Security (2%)
                            </code>
                        </p>
                    </div>
                </div>

                <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shrink-0 self-start md:self-auto">
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'attendance'
                                ? 'bg-black text-white shadow-2xs'
                                : 'text-slate-600 hover:text-black'
                        }`}
                    >
                        Time & Attendance View
                    </button>
                    <button
                        onClick={() => setActiveTab('financial')}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            activeTab === 'financial'
                                ? 'bg-black text-white shadow-2xs'
                                : 'text-slate-600 hover:text-black'
                        }`}
                    >
                        Financial & Tax View
                    </button>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={16} />
                    <input
                        type="text"
                        placeholder="Search employee by name, department, or bank details..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>

                {/* Dropdowns */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <div className="w-full sm:w-56">
                        <CustomDropdown
                            value={selectedMonth}
                            onChange={(val) => setSelectedMonth(val)}
                            icon={<Calendar size={13} />}
                            options={monthOptions}
                        />
                    </div>

                    <div className="w-full sm:w-52">
                        <CustomDropdown
                            value={departmentFilter}
                            onChange={(val) => setDepartmentFilter(val)}
                            icon={<Building2 size={13} />}
                            options={departmentOptions}
                        />
                    </div>

                    <div className="w-full sm:w-56">
                        <CustomDropdown
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val)}
                            icon={<Filter size={13} />}
                            options={statusFilterOptions}
                        />
                    </div>
                </div>
            </div>

            {/* Payroll & Attendance Calculation Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3.5 px-5">Staff Member</th>
                                {activeTab === 'attendance' ? (
                                    <>
                                        <th className="py-3.5 px-4">Working Time</th>
                                        <th className="py-3.5 px-4">Overtime (1.5x)</th>
                                        <th className="py-3.5 px-4">Late Check-in</th>
                                        <th className="py-3.5 px-4">Leave / Permission</th>
                                        <th className="py-3.5 px-4">Absent Days</th>
                                        <th className="py-3.5 px-4 font-black text-black">Calculated Net Pay</th>
                                        <th className="py-3.5 px-4">Status</th>
                                        <th className="py-3.5 px-4 text-right">Calculation Details</th>
                                    </>
                                ) : (
                                    <>
                                        <th className="py-3.5 px-4">Base Salary</th>
                                        <th className="py-3.5 px-4">Overtime Pay</th>
                                        <th className="py-3.5 px-4">Bonuses & Allowances</th>
                                        <th className="py-3.5 px-4">Attendance Deductions</th>
                                        <th className="py-3.5 px-4">Tax & SS Withheld</th>
                                        <th className="py-3.5 px-4 font-black text-black">Net Pay</th>
                                        <th className="py-3.5 px-4">Disbursement Bank</th>
                                        <th className="py-3.5 px-4 text-right">Payslip</th>
                                    </>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={activeTab === 'attendance' ? 9 : 9} className="py-12 text-center text-black font-bold">
                                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Computing attendance records, overtime hours, late penalties, and payroll calculations...
                                    </td>
                                </tr>
                            ) : filteredPayslips.length > 0 ? (
                                filteredPayslips.map((payslip) => {
                                    const isPaid = payslip.status === 'paid';
                                    const emp = payslip.employee;
                                    const workedH = payslip.earnings.workedHours || payslip.attendanceMetrics?.totalWorkingHours || (payslip.earnings.regularHours || 160);
                                    const targetH = payslip.earnings.targetDays ? payslip.earnings.targetDays * 8 : 176;
                                    const presentD = payslip.earnings.presentDays || payslip.attendanceMetrics?.presentDays || 21;
                                    const targetD = payslip.earnings.targetDays || payslip.attendanceMetrics?.targetDays || 22;
                                    const otH = payslip.earnings.overtimeHours || 0;
                                    const otPay = payslip.earnings.overtimePay || 0;
                                    const lateCount = payslip.deductions.lateCount ?? payslip.attendanceMetrics?.lateDays ?? 0;
                                    const lateDed = payslip.deductions.lateDeductions ?? (lateCount * (payslip.earnings.hourlyRate * 0.5));
                                    const leaveD = payslip.deductions.leaveDays ?? payslip.attendanceMetrics?.leaveDays ?? 0;
                                    const permD = payslip.deductions.permissionDays ?? payslip.attendanceMetrics?.permissionDays ?? 0;
                                    const absentD = payslip.deductions.absentDays ?? payslip.attendanceMetrics?.absentDays ?? 0;
                                    const absentDed = payslip.deductions.absentDeductions ?? (absentD * (payslip.earnings.hourlyRate * 8));

                                    return (
                                        <tr key={payslip._id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Staff Column */}
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs shrink-0">
                                                        {emp?.firstName?.[0] || 'S'}{emp?.lastName?.[0] || 'T'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-black block">
                                                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member'}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-600">
                                                            {typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || 'General'} · {emp?.position || 'Staff'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {activeTab === 'attendance' ? (
                                                <>
                                                    {/* Working Time */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center gap-1.5 font-mono font-bold text-black text-xs">
                                                                <Clock size={12} className="text-blue-600" />
                                                                <span>{workedH}h</span>
                                                                <span className="text-[10px] text-slate-500 font-normal">/ {targetH}h</span>
                                                            </div>
                                                            <div className="text-[10px] font-semibold text-slate-600">
                                                                {presentD} of {targetD} days present
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Overtime */}
                                                    <td className="py-3.5 px-4">
                                                        {otH > 0 ? (
                                                            <div>
                                                                <span className="font-mono font-black text-emerald-800 block text-xs">
                                                                    +{otH}h OT
                                                                </span>
                                                                <span className="text-[11px] font-mono font-bold text-emerald-700">
                                                                    +${otPay.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 font-mono text-xs">0h (—)</span>
                                                        )}
                                                    </td>

                                                    {/* Late */}
                                                    <td className="py-3.5 px-4">
                                                        {lateCount > 0 ? (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                                                                    <AlertTriangle size={10} />
                                                                    {lateCount}x Late
                                                                </span>
                                                                <span className="text-[11px] font-mono font-bold text-rose-700 block mt-0.5">
                                                                    -${lateDed.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                                                                <Check size={12} /> On-time
                                                            </span>
                                                        )}
                                                    </td>

                                                    {/* Leave & Permission */}
                                                    <td className="py-3.5 px-4">
                                                        <div className="space-y-0.5 text-xs">
                                                            {leaveD > 0 && (
                                                                <span className="inline-block px-1.5 py-0.5 bg-blue-50 text-blue-900 border border-blue-200 rounded text-[10px] font-bold mr-1">
                                                                    {leaveD}d Leave
                                                                </span>
                                                            )}
                                                            {permD > 0 && (
                                                                <span className="inline-block px-1.5 py-0.5 bg-purple-50 text-purple-900 border border-purple-200 rounded text-[10px] font-bold">
                                                                    {permD}d Perm
                                                                </span>
                                                            )}
                                                            {leaveD === 0 && permD === 0 && (
                                                                <span className="text-slate-400 font-mono text-xs">0 days</span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* Absent */}
                                                    <td className="py-3.5 px-4">
                                                        {absentD > 0 ? (
                                                            <div>
                                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-900 border border-rose-200 text-[10px] font-bold">
                                                                    {absentD}d Absent
                                                                </span>
                                                                <span className="text-[11px] font-mono font-bold text-rose-700 block mt-0.5">
                                                                    -${absentDed.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400 font-mono text-xs">0 days</span>
                                                        )}
                                                    </td>

                                                    {/* Net Pay */}
                                                    <td className="py-3.5 px-4">
                                                        <div>
                                                            <span className="font-mono font-black text-black text-sm block">
                                                                ${payslip.netPay.toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] font-semibold text-slate-500">
                                                                Rate: ${payslip.earnings.hourlyRate}/h
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* Status */}
                                                    <td className="py-3.5 px-4">
                                                        <button
                                                            onClick={() => handleToggleStatus(payslip._id, payslip.status)}
                                                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black cursor-pointer transition-all ${
                                                                isPaid
                                                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                                                                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                                                            }`}
                                                            title="Click to toggle Paid/Pending"
                                                        >
                                                            {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                            <span>{isPaid ? 'Paid' : 'Pending'}</span>
                                                        </button>
                                                    </td>

                                                    {/* Actions */}
                                                    <td className="py-3.5 px-4 text-right">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() => setSelectedPayslip(payslip)}
                                                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-black font-bold rounded-lg transition-colors text-xs cursor-pointer inline-flex items-center gap-1"
                                                                title="Inspect step-by-step attendance & salary calculation"
                                                            >
                                                                <Calculator size={12} />
                                                                <span>Formula</span>
                                                            </button>
                                                            <Link
                                                                href={`/dashboard/payroll/payslips/${payslip._id}`}
                                                                className="px-2.5 py-1 bg-black hover:bg-slate-800 text-white font-bold rounded-lg transition-colors text-xs cursor-pointer inline-flex items-center gap-1"
                                                            >
                                                                <Eye size={12} />
                                                                <span>Payslip</span>
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    {/* Financial View Columns */}
                                                    <td className="py-3.5 px-4 font-mono font-bold text-black">
                                                        ${payslip.earnings.baseSalary.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                                                        +${payslip.earnings.overtimePay.toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-semibold text-emerald-700">
                                                        +${(payslip.earnings.bonuses + payslip.earnings.allowances).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-700">
                                                        -${((payslip.deductions.lateDeductions || 0) + (payslip.deductions.absentDeductions || 0) + (payslip.deductions.leaveDeductions || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-semibold text-purple-700">
                                                        -${((payslip.deductions.taxWithholding || 0) + (payslip.deductions.socialSecurity || 0)).toFixed(2)}
                                                    </td>
                                                    <td className="py-3.5 px-4 font-mono font-black text-black text-sm">
                                                        ${payslip.netPay.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4">
                                                        <span className="font-bold text-black block text-xs">
                                                            {payslip.bankDetails?.bankName || 'ABA Bank'}
                                                        </span>
                                                        <span className="text-[10px] font-mono text-slate-600">
                                                            {payslip.bankDetails?.accountNumber || '—'}
                                                        </span>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right">
                                                        <Link
                                                            href={`/dashboard/payroll/payslips/${payslip._id}`}
                                                            className="px-2.5 py-1 bg-black text-white hover:bg-slate-800 font-bold rounded-lg transition-colors text-xs cursor-pointer inline-flex items-center gap-1"
                                                        >
                                                            <Receipt size={12} />
                                                            <span>Voucher</span>
                                                        </Link>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-700 font-bold">
                                        No attendance payroll records found matching the filter criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Attendance Calculation Breakdown Modal */}
            {selectedPayslip && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
                    <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-bold">
                                    <Calculator size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-black">
                                        Attendance & Salary Calculation Engine
                                    </h2>
                                    <p className="text-xs font-semibold text-slate-600">
                                        Staff Member: {selectedPayslip.employee?.firstName} {selectedPayslip.employee?.lastName} ({selectedPayslip.employee?.position})
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedPayslip(null)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-black transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Step-by-Step Mathematical Calculation */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                                Mathematical Breakdown (Time Tracking & Deductions)
                            </h3>

                            {/* Line items */}
                            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2.5 text-xs font-mono">
                                {/* Base Regular Pay */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <span className="text-slate-700 font-bold font-sans">
                                        1. Base Rate / Standard Month ({selectedPayslip.earnings.targetDays || 22} work days @ 8h/day):
                                    </span>
                                    <span className="font-black text-black">
                                        +${selectedPayslip.earnings.baseSalary.toFixed(2)}
                                    </span>
                                </div>

                                {/* Overtime Pay */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <div className="font-sans">
                                        <span className="text-emerald-800 font-bold block">
                                            2. Overtime (OT) Logged:
                                        </span>
                                        <span className="text-[11px] text-slate-600">
                                            {selectedPayslip.earnings.overtimeHours} hours × (${selectedPayslip.earnings.hourlyRate} × 1.5 Rate = ${selectedPayslip.earnings.overtimeRate || (selectedPayslip.earnings.hourlyRate * 1.5).toFixed(2)}/h)
                                        </span>
                                    </div>
                                    <span className="font-black text-emerald-700">
                                        +${selectedPayslip.earnings.overtimePay.toFixed(2)}
                                    </span>
                                </div>

                                {/* Late Penalties */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <div className="font-sans">
                                        <span className="text-rose-800 font-bold block">
                                            3. Late Check-in Penalties:
                                        </span>
                                        <span className="text-[11px] text-slate-600">
                                            {selectedPayslip.deductions.lateCount || 0} occurrences × (0.5h rate penalty @ ${selectedPayslip.earnings.hourlyRate}/h)
                                        </span>
                                    </div>
                                    <span className="font-black text-rose-700">
                                        -${(selectedPayslip.deductions.lateDeductions || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Absent Deductions */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <div className="font-sans">
                                        <span className="text-rose-800 font-bold block">
                                            4. Unexcused Absences:
                                        </span>
                                        <span className="text-[11px] text-slate-600">
                                            {selectedPayslip.deductions.absentDays || 0} absent days × (Daily Rate ${selectedPayslip.earnings.hourlyRate * 8}/day)
                                        </span>
                                    </div>
                                    <span className="font-black text-rose-700">
                                        -${(selectedPayslip.deductions.absentDeductions || 0).toFixed(2)}
                                    </span>
                                </div>

                                {/* Leaves & Permissions */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <div className="font-sans">
                                        <span className="text-blue-800 font-bold block">
                                            5. Approved Leaves & Permissions:
                                        </span>
                                        <span className="text-[11px] text-slate-600">
                                            {selectedPayslip.deductions.leaveDays || 0}d Paid Leave · {selectedPayslip.deductions.permissionDays || 0}d Permission (Excused)
                                        </span>
                                    </div>
                                    <span className="font-bold text-slate-600">
                                        $0.00 (Excused)
                                    </span>
                                </div>

                                {/* Bonuses & Allowances */}
                                <div className="flex justify-between items-center py-1 border-b border-slate-200">
                                    <span className="text-slate-700 font-bold font-sans">
                                        6. Performance & Travel Allowances:
                                    </span>
                                    <span className="font-black text-emerald-700">
                                        +${(selectedPayslip.earnings.bonuses + selectedPayslip.earnings.allowances).toFixed(2)}
                                    </span>
                                </div>

                                {/* Tax & Social Security */}
                                <div className="flex justify-between items-center py-1">
                                    <div className="font-sans">
                                        <span className="text-purple-800 font-bold block">
                                            7. Statutory Withholdings (5% Tax + 2% Social Security):
                                        </span>
                                        <span className="text-[11px] text-slate-600">
                                            Tax: -${selectedPayslip.deductions.taxWithholding.toFixed(2)} | SS: -${selectedPayslip.deductions.socialSecurity.toFixed(2)}
                                        </span>
                                    </div>
                                    <span className="font-black text-purple-800">
                                        -${(selectedPayslip.deductions.taxWithholding + selectedPayslip.deductions.socialSecurity).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Net Total Callout */}
                        <div className="bg-black text-white rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                                    Final Calculated Net Payable
                                </span>
                                <span className="text-xs text-slate-300">
                                    Calculated automatically for {selectedPayslip.month} {selectedPayslip.year}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-2xl font-black font-mono text-white">
                                    ${selectedPayslip.netPay.toLocaleString()}
                                </span>
                                <span className="text-xs text-emerald-400 font-bold block">USD Net Disbursed</span>
                            </div>
                        </div>

                        {/* Modal Footer Actions */}
                        <div className="flex items-center justify-between gap-3 pt-2">
                            <button
                                onClick={() => setSelectedPayslip(null)}
                                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-black text-xs font-bold rounded-xl transition-colors cursor-pointer"
                            >
                                Close Breakdown
                            </button>
                            <Link
                                href={`/dashboard/payroll/payslips/${selectedPayslip._id}`}
                                className="px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                            >
                                <Printer size={14} />
                                <span>Open Full Printable Payslip Voucher</span>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
