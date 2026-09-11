'use client';

import { useState } from 'react';
import { 
    DollarSign, 
    CreditCard, 
    Receipt, 
    Download, 
    Plus 
} from 'lucide-react';

export default function PayrollPage() {
    return (
        <div className="w-full space-y-6 animate-in fade-in duration-300 font-sans">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-2">
                        <DollarSign size={13} />
                        <span>Finance & Payroll</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                        Payroll Management
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                        Manage salary calculations, pay periods, and employee payslips.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer">
                        <Plus size={14} />
                        <span>Run Payroll</span>
                    </button>
                </div>
            </div>

            {/* Canvas Placeholder */}
            <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center flex flex-col items-center justify-center min-h-[420px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                    <CreditCard size={28} />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                    Payroll Canvas Ready
                </h3>
                <p className="text-sm text-slate-500 max-w-md">
                    Ready for your updated compensation tables, pay period batches, and disbursement cards.
                </p>
            </div>
        </div>
    );
}
