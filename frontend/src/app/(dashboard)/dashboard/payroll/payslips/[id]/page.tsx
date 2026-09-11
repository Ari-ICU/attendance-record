'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Receipt,
    Printer,
    Download,
    ArrowLeft,
    Building2,
    CheckCircle2,
    Clock,
    DollarSign,
    ShieldCheck
} from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';
import { Payslip } from '@/types/payroll.types';

export default function PayslipDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [payslip, setPayslip] = useState<Payslip | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayslip = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await PayrollService.getPayslipById(id);
                setPayslip(data);
            } catch (err) {
                console.error('Failed to load payslip', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayslip();
    }, [id]);

    if (loading) {
        return (
            <div className="w-full min-h-[400px] flex items-center justify-center">
                <div className="text-center font-bold text-black">
                    <div className="w-8 h-8 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span>Loading official payslip voucher...</span>
                </div>
            </div>
        );
    }

    if (!payslip) {
        return (
            <div className="w-full bg-white p-12 rounded-3xl border border-slate-200 text-center">
                <Receipt size={36} className="text-slate-400 mx-auto mb-2" />
                <h3 className="text-lg font-black text-black">Payslip Not Found</h3>
                <p className="text-xs font-semibold text-slate-700 mt-1">The requested salary record could not be located.</p>
                <Link
                    href="/dashboard/payroll"
                    className="inline-block mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl"
                >
                    Back to Payroll
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 font-sans">
            {/* Action Bar */}
            <div className="flex items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs print:hidden">
                <Link
                    href="/dashboard/payroll"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-black transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Payroll Overview</span>
                </Link>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                        <Printer size={14} />
                        <span>Print Payslip</span>
                    </button>
                </div>
            </div>

            {/* Official Printable Voucher */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-xs space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200 mb-2">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            <span>OFFICIAL SALARY VOUCHER</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight">
                            StaffFlow Inc.
                        </h1>
                        <p className="text-xs font-bold text-slate-700">Workforce & Human Capital Management</p>
                        <p className="text-[11px] text-slate-600">Phnom Penh Corporate HQ · Tax ID: KH-99201</p>
                    </div>

                    <div className="text-left sm:text-right">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 block">Statement Period</span>
                        <span className="text-lg font-black text-black block">{payslip.month} {payslip.year}</span>
                        <span className="text-xs font-mono text-slate-600 block">Ref: {payslip._id.toUpperCase()}</span>
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md inline-block mt-1">
                            Status: {payslip.status.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* Staff & Payment Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Employee</span>
                        <span className="font-black text-black text-sm mt-0.5 block">
                            {payslip.employee?.firstName} {payslip.employee?.lastName}
                        </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Department</span>
                        <span className="font-bold text-black text-xs mt-0.5 block truncate">
                            {typeof payslip.employee?.department === 'object' ? (payslip.employee.department as any)?.name : payslip.employee?.department || 'Operations'}
                        </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Position / Role</span>
                        <span className="font-bold text-black text-xs mt-0.5 block truncate">
                            {payslip.employee?.position || 'Staff'}
                        </span>
                    </div>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Disbursement Account</span>
                        <span className="font-bold text-emerald-800 text-xs mt-0.5 block">
                            {payslip.bankDetails?.bankName} ({payslip.bankDetails?.accountNumber})
                        </span>
                    </div>
                </div>

                {/* Earnings & Deductions Tables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Earnings */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-slate-200">
                            Earnings Breakdown
                        </h3>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Base Monthly Salary (160h)</span>
                            <span className="font-mono">${payslip.earnings.baseSalary.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Overtime Pay ({payslip.earnings.overtimeHours}h @ 1.5x)</span>
                            <span className="font-mono text-emerald-700">+${payslip.earnings.overtimePay.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Performance Bonuses</span>
                            <span className="font-mono text-emerald-700">+${payslip.earnings.bonuses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Allowances (Travel & Food)</span>
                            <span className="font-mono text-emerald-700">+${payslip.earnings.allowances.toFixed(2)}</span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-200 flex justify-between text-sm font-black text-black">
                            <span>Gross Earnings</span>
                            <span className="font-mono">${payslip.earnings.grossEarnings.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Deductions */}
                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                        <h3 className="text-xs font-black text-black uppercase tracking-wider pb-2 border-b border-slate-200">
                            Taxes & Deductions
                        </h3>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Income Tax Withholding (5%)</span>
                            <span className="font-mono text-rose-700">-${payslip.deductions.taxWithholding.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Social Security Fund (2%)</span>
                            <span className="font-mono text-rose-700">-${payslip.deductions.socialSecurity.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-800">
                            <span>Unpaid Leave Days ({payslip.deductions.unpaidLeaveDays}d)</span>
                            <span className="font-mono text-rose-700">-${payslip.deductions.leaveDeductions.toFixed(2)}</span>
                        </div>
                        <div className="pt-2.5 border-t border-slate-200 flex justify-between text-sm font-black text-rose-800">
                            <span>Total Deductions</span>
                            <span className="font-mono">-${payslip.deductions.totalDeductions.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Net Total Box */}
                <div className="p-5 bg-black text-white rounded-2xl flex items-center justify-between shadow-md">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Total Net Disbursed Pay</span>
                        <span className="text-xs font-bold text-emerald-400">Direct Deposit Wire Transfer</span>
                    </div>
                    <div className="text-right">
                        <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                            ${payslip.netPay.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-300 block">USD</span>
                    </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
                    <div>
                        <div className="border-b border-dashed border-slate-400 h-12 mb-1" />
                        <span className="font-bold text-slate-700">Employee Signature</span>
                    </div>
                    <div>
                        <div className="border-b border-dashed border-slate-400 h-12 mb-1" />
                        <span className="font-bold text-slate-700">Authorized Human Resources Director</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
