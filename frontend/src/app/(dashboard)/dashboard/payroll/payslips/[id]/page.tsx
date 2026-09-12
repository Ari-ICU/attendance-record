'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Printer, ArrowLeft, Receipt } from 'lucide-react';
import { PayrollService } from '@/services/payroll.service';
import { Payslip } from '@/types/payroll.types';

export default function PayslipDetailPage() {
    const params = useParams();
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
                <div className="text-center font-semibold text-black">
                    <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span className="text-sm">Loading payslip document...</span>
                </div>
            </div>
        );
    }

    if (!payslip) {
        return (
            <div className="w-full bg-white p-12 border border-black text-center max-w-lg mx-auto my-12">
                <Receipt size={36} className="text-black mx-auto mb-2" />
                <h3 className="text-base font-bold text-black uppercase tracking-wide">Payslip Not Found</h3>
                <p className="text-xs text-black mt-1">The requested salary record could not be located.</p>
                <Link
                    href="/dashboard/payroll"
                    className="inline-block mt-4 px-4 py-2 bg-white text-black text-xs font-bold border border-black hover:bg-neutral-100 transition-colors"
                >
                    Back to Payroll Overview
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen py-4 sm:py-8 font-sans text-black print:p-0 print:m-0 print:min-h-0 print:w-full">
            {/* Action Bar (Hidden when printing) */}
            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between gap-4 p-3 bg-white border border-neutral-300 print:hidden">
                <Link
                    href="/dashboard/payroll"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-black hover:underline"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Payroll Overview</span>
                </Link>

                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-black text-white hover:bg-neutral-800 text-xs font-bold transition-all cursor-pointer"
                >
                    <Printer size={14} />
                    <span>Print (A4 Sheet)</span>
                </button>
            </div>

            {/* A4 Printable Sheet (Clean, Monochrome, No Backgrounds) */}
            <div className="w-full max-w-[210mm] mx-auto bg-white border border-black p-4 sm:p-8 lg:p-12 print:border-none print:p-0 print:m-0 print:w-full print:max-w-none text-black">
                {/* Document Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-4 border-b-2 border-black">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-tight text-black">
                            StaffFlow Co., Ltd.
                        </h1>
                        <p className="text-xs text-neutral-800">Workforce & Human Capital Management System</p>
                        <p className="text-xs text-neutral-700">Phnom Penh Corporate Tower, Level 14 · Tax ID: KH-99201</p>
                        <p className="text-xs text-neutral-700">Phone: +855 (0) 23 888 999 · Email: payroll@staffflow.io</p>
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-300 w-full sm:w-auto">
                        <div className="text-base sm:text-lg font-bold uppercase tracking-wide text-black">
                            SALARY PAYSLIP
                        </div>
                        <div className="text-xs text-neutral-800 font-medium mt-1">
                            <span>Period: </span>
                            <span className="font-bold text-black">{payslip.month} {payslip.year}</span>
                        </div>
                        <div className="text-xs font-mono text-neutral-800">
                            <span>Voucher Ref: </span>
                            <span className="font-bold text-black">{payslip._id.toUpperCase()}</span>
                        </div>
                        <div className="text-xs text-neutral-800">
                            <span>Status: </span>
                            <span className="font-bold uppercase text-black">{payslip.status}</span>
                        </div>
                    </div>
                </div>

                {/* Employee Information Section */}
                <div className="mt-6 border border-black">
                    <div className="bg-white px-3 py-1.5 border-b border-black text-[11px] font-bold uppercase tracking-wider text-black">
                        Employee & Payment Particulars
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 text-xs divide-y sm:divide-y-0 sm:divide-x divide-black">
                        <div className="divide-y divide-neutral-300">
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Employee Name:</span>
                                <span className="font-bold text-black">
                                    {payslip.employee?.firstName} {payslip.employee?.lastName}
                                </span>
                            </div>
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Staff ID:</span>
                                <span className="font-mono font-bold text-black">
                                    {payslip.employee?._id || 'EMP-1092'}
                                </span>
                            </div>
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Department:</span>
                                <span className="font-semibold text-black">
                                    {typeof payslip.employee?.department === 'object'
                                        ? (payslip.employee.department as any)?.name
                                        : payslip.employee?.department || 'Operations'}
                                </span>
                            </div>
                        </div>

                        <div className="divide-y divide-neutral-300">
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Position / Title:</span>
                                <span className="font-semibold text-black">
                                    {payslip.employee?.position || 'Staff'}
                                </span>
                            </div>
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Payment Channel:</span>
                                <span className="font-semibold text-black">Bank Direct Transfer</span>
                            </div>
                            <div className="flex justify-between px-3 py-2">
                                <span className="font-medium text-neutral-700">Disbursement Account:</span>
                                <span className="font-mono font-bold text-black">
                                    {payslip.bankDetails?.bankName} ({payslip.bankDetails?.accountNumber})
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Earnings & Deductions Table */}
                <div className="mt-6 border border-black overflow-hidden">
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black border-b border-black print:grid-cols-2 print:divide-y-0 print:divide-x">
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black">
                            Earnings / Allowances
                        </div>
                        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-black">
                            Deductions / Taxes
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black text-xs print:grid-cols-2 print:divide-y-0 print:divide-x">
                        {/* Earnings Column */}
                        <div className="divide-y divide-neutral-200">
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Basic Monthly Salary</span>
                                <span className="font-mono font-medium shrink-0">${payslip.earnings.baseSalary.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Overtime Pay ({payslip.earnings.overtimeHours}h @ 1.5x)</span>
                                <span className="font-mono font-medium shrink-0">${payslip.earnings.overtimePay.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Performance Incentive</span>
                                <span className="font-mono font-medium shrink-0">${payslip.earnings.bonuses.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Allowances (Travel & Subsistence)</span>
                                <span className="font-mono font-medium shrink-0">${payslip.earnings.allowances.toFixed(2)}</span>
                            </div>
                        </div>

                        {/* Deductions Column */}
                        <div className="divide-y divide-neutral-200">
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Income Tax Withholding (5%)</span>
                                <span className="font-mono font-medium shrink-0">${payslip.deductions.taxWithholding.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">National Social Security (2%)</span>
                                <span className="font-mono font-medium shrink-0">${payslip.deductions.socialSecurity.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center px-3 py-2 gap-2">
                                <span className="text-neutral-800">Unpaid Leave ({payslip.deductions.unpaidLeaveDays} days)</span>
                                <span className="font-mono font-medium shrink-0">${payslip.deductions.leaveDeductions.toFixed(2)}</span>
                            </div>
                            <div className="hidden sm:flex print:flex justify-between items-center px-3 py-2 text-neutral-400">
                                <span>-</span>
                                <span className="font-mono">-</span>
                            </div>
                        </div>
                    </div>

                    {/* Subtotals */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-black border-t border-black text-xs font-bold print:grid-cols-2 print:divide-y-0 print:divide-x">
                        <div className="flex justify-between items-center px-3 py-2 bg-white">
                            <span>GROSS EARNINGS</span>
                            <span className="font-mono text-sm">${payslip.earnings.grossEarnings.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center px-3 py-2 bg-white">
                            <span>TOTAL DEDUCTIONS</span>
                            <span className="font-mono text-sm">${payslip.deductions.totalDeductions.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Net Salary Total Box */}
                <div className="mt-6 border-2 border-black p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-black">
                            Net Disbursed Salary
                        </div>
                        <div className="text-[11px] text-neutral-700">
                            Payment Processed via Automated Clearing House (ACH) / Direct Wire
                        </div>
                    </div>
                    <div className="text-left sm:text-right">
                        <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-black">
                            ${payslip.netPay.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-neutral-800 ml-1">USD</span>
                    </div>
                </div>

                {/* Signatures & Authorizations */}
                <div className="mt-14 pt-4 grid grid-cols-2 sm:grid-cols-3 gap-8 text-center text-xs">
                    <div>
                        <div className="border-b border-black h-12 mb-1.5" />
                        <span className="font-bold text-black block">Prepared By</span>
                        <span className="text-[11px] text-neutral-700 block">Payroll Accountant</span>
                    </div>
                    <div className="hidden sm:block">
                        <div className="border-b border-black h-12 mb-1.5" />
                        <span className="font-bold text-black block">Authorized By</span>
                        <span className="text-[11px] text-neutral-700 block">Director of Human Resources</span>
                    </div>
                    <div>
                        <div className="border-b border-black h-12 mb-1.5" />
                        <span className="font-bold text-black block">Employee Signature</span>
                        <span className="text-[11px] text-neutral-700 block">Acknowledged & Received</span>
                    </div>
                </div>

                {/* Document Footer Notice */}
                <div className="mt-10 pt-4 border-t border-neutral-300 text-[10px] text-neutral-600 text-center flex flex-col sm:flex-row justify-between items-center gap-1">
                    <span>This is a computer-generated document. Generated from StaffFlow Portal.</span>
                    <span>Printed on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            </div>
        </div>
    );
}

