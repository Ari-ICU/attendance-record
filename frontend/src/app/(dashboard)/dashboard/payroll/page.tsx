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
    Sparkles
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
    const [searchTerm, setSearchTerm] = useState('');
    const [previewPayslip, setPreviewPayslip] = useState<Payslip | null>(null);

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

    // Re-run payroll calculation
    const handleRunPayroll = async () => {
        setRefreshing(true);
        const res = await PayrollService.generatePayrollRun(selectedMonth, parseInt(selectedYear));
        setSummary(res);
        setRefreshing(false);
    };

    // Export CSV simulation
    const handleExportCSV = () => {
        if (!summary) return;
        const headers = 'Employee,Department,Position,Base Salary,Overtime Hours,Overtime Pay,Bonuses,Deductions,Net Pay,Status,Bank Account\n';
        const rows = summary.payslips.map(p => {
            const empName = `${p.employee?.firstName} ${p.employee?.lastName}`;
            const dept = typeof p.employee?.department === 'object' ? (p.employee.department as any)?.name : p.employee?.department || 'General';
            return `"${empName}","${dept}","${p.employee?.position || 'Staff'}",${p.earnings.baseSalary},${p.earnings.overtimeHours},${p.earnings.overtimePay},${p.earnings.bonuses},${p.deductions.totalDeductions},${p.netPay},"${p.status}","${p.bankDetails?.bankName} - ${p.bankDetails?.accountNumber}"`;
        }).join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StaffFlow_Payroll_${selectedMonth}_${selectedYear}.csv`;
        a.click();
    };

    // Filter payslips
    const filteredPayslips = (summary?.payslips || []).filter(p => {
        const empName = `${p.employee?.firstName || ''} ${p.employee?.lastName || ''}`.toLowerCase();
        const dept = (typeof p.employee?.department === 'object' ? (p.employee.department as any)?.name : p.employee?.department || '').toLowerCase();
        const matchesSearch = empName.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || dept.includes(departmentFilter.toLowerCase());
        return matchesSearch && matchesDept;
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

    return (
        <div className="w-full space-y-6 pb-16 font-sans">
            {/* Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-7 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                                <DollarSign size={13} className="text-emerald-600" />
                                <span>PAYROLL & COMPENSATION ENGINE</span>
                            </div>
                            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1 rounded-full">
                                Fiscal Period: {selectedMonth} {selectedYear}
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                            Workforce Payroll & Compensation
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-700 max-w-2xl">
                            Automated monthly salary calculation based on attendance hours, overtime rates, tax withholdings, and digital payslips.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2.5 flex-wrap">
                        <button
                            onClick={handleRunPayroll}
                            disabled={refreshing}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span>Recalculate Payroll</span>
                        </button>

                        <button
                            onClick={handleMarkAllPaid}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <CheckCircle2 size={14} />
                            <span>Disburse All</span>
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-100 text-black border border-slate-300 text-xs sm:text-sm font-bold rounded-xl shadow-2xs transition-all active:scale-95 cursor-pointer"
                            title="Export Bank CSV File"
                        >
                            <Download size={14} />
                            <span className="hidden sm:inline">Bank Wire CSV</span>
                        </button>

                        <button
                            onClick={() => loadPayroll(false)}
                            disabled={refreshing}
                            className={`p-2.5 rounded-xl bg-white border border-slate-200 text-black hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer ${
                                refreshing ? 'animate-spin text-black' : ''
                            }`}
                            title="Refresh"
                        >
                            <RefreshCw size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {/* 1. Total Net Payout */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Total Net Disbursed</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <DollarSign size={17} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-black font-mono">
                                ${summary?.totalNetPayout ? summary.totalNetPayout.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">USD</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-800 mt-2 flex items-center gap-1">
                            <span>{summary?.totalStaffCount || 6} Staff Members Paid</span>
                        </p>
                    </div>
                </div>

                {/* 2. Total Base Salaries */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Base Salary Cost</span>
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <Building2 size={17} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-black font-mono">
                                ${summary?.totalGrossSalary ? summary.totalGrossSalary.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-slate-600">USD</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2">
                            Regular 160h work month baseline
                        </p>
                    </div>
                </div>

                {/* 3. Overtime Compensation */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Overtime Compensation</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <Clock size={17} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-black font-mono">
                                ${summary?.totalOvertimePay ? summary.totalOvertimePay.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-amber-900">@ 1.5x Rate</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2">
                            Calculated from approved overtime logs
                        </p>
                    </div>
                </div>

                {/* 4. Taxes & Deductions */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Total Deductions & Tax</span>
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <Receipt size={17} />
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-black font-mono">
                                -${summary?.totalDeductions ? summary.totalDeductions.toLocaleString() : '0'}
                            </span>
                            <span className="text-xs font-bold text-purple-900">Withheld</span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mt-2">
                            5% Income Tax & 2% Social Security
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Toolbar */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={16} />
                    <input
                        type="text"
                        placeholder="Search employee by name, department, or bank account..."
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
                </div>
            </div>

            {/* Payroll Table */}
            <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                <th className="py-3 px-5">Staff Member</th>
                                <th className="py-3 px-5">Base Salary</th>
                                <th className="py-3 px-5">Overtime (1.5x)</th>
                                <th className="py-3 px-5">Bonuses</th>
                                <th className="py-3 px-5">Deductions</th>
                                <th className="py-3 px-5 font-black text-black">Net Pay</th>
                                <th className="py-3 px-5">Bank Account</th>
                                <th className="py-3 px-5">Status</th>
                                <th className="py-3 px-5 text-right">Payslip</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-black font-bold">
                                        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                        Calculating monthly payroll & timesheets...
                                    </td>
                                </tr>
                            ) : filteredPayslips.length > 0 ? (
                                filteredPayslips.map((payslip) => {
                                    const isPaid = payslip.status === 'paid';
                                    const emp = payslip.employee;

                                    return (
                                        <tr key={payslip._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                                                        {emp?.firstName?.[0] || 'S'}{emp?.lastName?.[0] || 'T'}
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-black block">
                                                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Staff Member'}
                                                        </span>
                                                        <span className="text-[11px] font-semibold text-slate-700">
                                                            {typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || 'General'} · {emp?.position || 'Staff'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="py-3.5 px-5 font-mono font-bold text-black">
                                                ${payslip.earnings.baseSalary.toLocaleString()}
                                            </td>

                                            <td className="py-3.5 px-5">
                                                <span className="font-mono font-black text-black block">
                                                    +${payslip.earnings.overtimePay.toFixed(2)}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-600">
                                                    {payslip.earnings.overtimeHours}h extra
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-5 font-mono font-semibold text-emerald-700">
                                                +${(payslip.earnings.bonuses + payslip.earnings.allowances).toFixed(2)}
                                            </td>

                                            <td className="py-3.5 px-5 font-mono font-semibold text-rose-700">
                                                -${payslip.deductions.totalDeductions.toFixed(2)}
                                            </td>

                                            <td className="py-3.5 px-5 font-mono font-black text-black text-sm">
                                                ${payslip.netPay.toLocaleString()}
                                            </td>

                                            <td className="py-3.5 px-5">
                                                <span className="font-bold text-black block">
                                                    {payslip.bankDetails?.bankName || 'ABA Bank'}
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-600">
                                                    {payslip.bankDetails?.accountNumber || '—'}
                                                </span>
                                            </td>

                                            <td className="py-3.5 px-5">
                                                <button
                                                    onClick={() => handleToggleStatus(payslip._id, payslip.status)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-black cursor-pointer transition-all ${
                                                        isPaid
                                                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                                            : 'bg-amber-50 text-amber-900 border border-amber-200'
                                                    }`}
                                                    title="Click to toggle Paid/Pending"
                                                >
                                                    {isPaid ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                    <span>{isPaid ? 'Paid' : 'Pending'}</span>
                                                </button>
                                            </td>

                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        onClick={() => setPreviewPayslip(payslip)}
                                                        className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors text-xs cursor-pointer inline-flex items-center gap-1"
                                                    >
                                                        <Eye size={12} />
                                                        <span>Payslip</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center text-slate-700 font-bold">
                                        No payroll records found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Printable Digital Payslip Modal */}
            {previewPayslip && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
                        {/* Top Bar with Print and Close Actions */}
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <Receipt size={20} className="text-black" />
                                <h3 className="text-base sm:text-lg font-black text-black">Official Monthly Payslip</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                                >
                                    <Printer size={13} />
                                    <span>Print Voucher</span>
                                </button>
                                <button
                                    onClick={() => setPreviewPayslip(null)}
                                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-black transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Payslip Voucher Body */}
                        <div className="mt-6 space-y-6">
                            {/* Company Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                                <div>
                                    <h2 className="text-lg font-black text-black tracking-tight">StaffFlow Inc.</h2>
                                    <p className="text-xs font-bold text-slate-700">Corporate Workforce & Attendance</p>
                                    <p className="text-[11px] text-slate-600 mt-0.5">Phnom Penh Corporate HQ · Tax ID: KH-99201</p>
                                </div>
                                <div className="text-left sm:text-right">
                                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Payslip Period</span>
                                    <span className="text-sm font-black text-black block">{previewPayslip.month} {previewPayslip.year}</span>
                                    <span className="text-[10px] font-mono text-slate-600 block">Issued: {previewPayslip.paymentDate}</span>
                                </div>
                            </div>

                            {/* Employee Information */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Employee Name</span>
                                    <span className="font-black text-black text-xs mt-0.5 block">
                                        {previewPayslip.employee?.firstName} {previewPayslip.employee?.lastName}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Department</span>
                                    <span className="font-bold text-black text-xs mt-0.5 block truncate">
                                        {typeof previewPayslip.employee?.department === 'object' ? (previewPayslip.employee.department as any)?.name : previewPayslip.employee?.department || 'Operations'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Position / Role</span>
                                    <span className="font-bold text-black text-xs mt-0.5 block truncate">
                                        {previewPayslip.employee?.position || 'Staff'}
                                    </span>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Disbursement</span>
                                    <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                                        {previewPayslip.bankDetails?.bankName} ({previewPayslip.bankDetails?.accountNumber})
                                    </span>
                                </div>
                            </div>

                            {/* Earnings & Deductions Tables */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Earnings */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                    <h4 className="text-xs font-black text-black uppercase tracking-wider pb-1.5 border-b border-slate-200">
                                        Earnings Breakdown
                                    </h4>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Base Salary (160h)</span>
                                        <span className="font-mono">${previewPayslip.earnings.baseSalary.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Overtime ({previewPayslip.earnings.overtimeHours}h @ 1.5x)</span>
                                        <span className="font-mono text-emerald-700">+${previewPayslip.earnings.overtimePay.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Performance Bonuses</span>
                                        <span className="font-mono text-emerald-700">+${previewPayslip.earnings.bonuses.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Travel & Meal Allowance</span>
                                        <span className="font-mono text-emerald-700">+${previewPayslip.earnings.allowances.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-black">
                                        <span>Gross Earnings</span>
                                        <span className="font-mono">${previewPayslip.earnings.grossEarnings.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Deductions */}
                                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                    <h4 className="text-xs font-black text-black uppercase tracking-wider pb-1.5 border-b border-slate-200">
                                        Tax & Deductions
                                    </h4>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Income Tax Withholding (5%)</span>
                                        <span className="font-mono text-rose-700">-${previewPayslip.deductions.taxWithholding.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Social Security (2%)</span>
                                        <span className="font-mono text-rose-700">-${previewPayslip.deductions.socialSecurity.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-bold text-slate-800">
                                        <span>Unpaid Leave Deductions</span>
                                        <span className="font-mono text-rose-700">-${previewPayslip.deductions.leaveDeductions.toFixed(2)}</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-rose-800">
                                        <span>Total Deductions</span>
                                        <span className="font-mono">-${previewPayslip.deductions.totalDeductions.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Net Take-Home Salary Total */}
                            <div className="p-4 bg-black text-white rounded-2xl flex items-center justify-between shadow-md">
                                <div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Net Disbursed Pay</span>
                                    <span className="text-xs font-bold text-emerald-400">Authorized & Processed</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
                                        ${previewPayslip.netPay.toFixed(2)}
                                    </span>
                                    <span className="text-xs font-bold text-slate-300 block">USD</span>
                                </div>
                            </div>

                            {/* Signatures */}
                            <div className="pt-4 border-t border-slate-200 grid grid-cols-2 gap-6 text-center text-xs">
                                <div>
                                    <div className="border-b border-dashed border-slate-400 h-10 mb-1" />
                                    <span className="font-bold text-slate-700">Employee Signature</span>
                                </div>
                                <div>
                                    <div className="border-b border-dashed border-slate-400 h-10 mb-1" />
                                    <span className="font-bold text-slate-700">Authorized HR Director</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
