'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    Wallet,
    Banknote,
    Clock,
    Search,
    Download,
    DollarSign,
    FileText,
    RefreshCw,
    X,
    RotateCcw,
    Check,
    Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFullImageUrl } from '@/utils/url.utils';
import { PayrollService } from '@/services/payroll.service';
import toast from 'react-hot-toast';

export default function PayrollPage() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDisbursing, setIsDisbursing] = useState(false);
    const [isApproving, setIsApproving] = useState(false);
    const [isDepositing, setIsDepositing] = useState(false);
    const [showDepositModal, setShowDepositModal] = useState(false);
    const [showBankSettings, setShowBankSettings] = useState(false);
    const [depositAmount, setDepositAmount] = useState('');
    const [selectedPayslip, setSelectedPayslip] = useState<any | null>(null);
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        accountName: ''
    });

    const [stats, setStats] = useState({
        totalPayroll: 0,
        disbursed: 0,
        pending: 0,
        efficiency: 0,
        masterBalance: 0,
        ownerResidual: 0
    });
    const [ledger, setLedger] = useState<any[]>([]);

    const fetchData = async () => {
        try {
            setRefreshing(true);
            const [statsData, ledgerData] = await Promise.all([
                PayrollService.getStats(),
                PayrollService.getLedger()
            ]);
            setStats(statsData);
            setBankDetails({
                accountNumber: statsData.accountNumber || '',
                accountName: statsData.accountName || ''
            });
            setLedger(ledgerData);
        } catch (error) {
            toast.error('Financial data sync failed');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const filteredLedger = ledger.filter(item =>
        item.employee.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.employee.lastName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredLedger.length / itemsPerPage);
    const paginatedLedger = filteredLedger.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDisburseAll = async () => {
        if (!confirm('Are you sure you want to approve and execute disbursement for all pending staff salaries?')) return;
        try {
            setIsDisbursing(true);
            await PayrollService.disburseAll();
            toast.success('Salaries disbursed successfully');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Disbursement failed');
        } finally {
            setIsDisbursing(false);
        }
    };

    const handleSingleDisburse = async (empId: string) => {
        try {
            await PayrollService.disburse(empId);
            toast.success('Disbursement executed');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Disbursement failed');
        }
    };

    const handleDeposit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setIsDepositing(true);
            await PayrollService.deposit({ amount: parseFloat(depositAmount) });
            toast.success('Funds deposited successfully');
            setShowDepositModal(false);
            setDepositAmount('');
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Deposit failed');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleSaveBank = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await PayrollService.updateBankAccount(bankDetails);
            toast.success('Bank credentials updated');
            setShowBankSettings(false);
            fetchData();
        } catch (error: any) {
            toast.error('Failed to update bank details');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <CreditCard size={24} className="text-blue-600" />
                        <span>Compensation & Payroll Ledger</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Automated hourly & monthly compensation calculated from biometric attendance records.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setShowDepositModal(true)}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs text-xs font-semibold transition-all"
                    >
                        <Wallet size={14} />
                        <span>Deposit Funds</span>
                    </button>
                    <button
                        onClick={handleDisburseAll}
                        disabled={isDisbursing}
                        className="inline-flex items-center gap-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-xs text-xs font-semibold transition-all disabled:opacity-50"
                    >
                        <Banknote size={14} />
                        <span>Disburse All</span>
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-2 rounded-xl bg-white border border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-2xs"
                    >
                        <RefreshCw size={14} className={refreshing ? 'animate-spin text-blue-600' : ''} />
                    </button>
                </div>
            </div>

            {/* Bento Financial Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500">Total Payroll Commitment</span>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <DollarSign size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-slate-900 tracking-tight font-sans">
                            ${stats.totalPayroll.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">Monthly Active Ledger</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500">Disbursed Volume</span>
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                            <Banknote size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600 tracking-tight font-sans">
                            ${stats.disbursed.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-emerald-600/80 font-medium">Completed Payouts</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500">Pending Approvals</span>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-600 tracking-tight font-sans">
                            ${stats.pending.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-amber-600/80 font-medium">Awaiting Payout</span>
                    </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold text-slate-500">Account Balance</span>
                        <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                            <Wallet size={16} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-indigo-600 tracking-tight font-sans">
                            ${stats.masterBalance.toLocaleString()}
                        </div>
                        <span className="text-[11px] text-indigo-600/80 font-medium">ABA PayWay Reserve</span>
                    </div>
                </div>
            </div>

            {/* Compensation Ledger Table Card */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                        <input
                            type="text"
                            placeholder="Filter staff by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 outline-none transition-colors"
                        />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                        {filteredLedger.length} Personnel in Payroll
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[750px]">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                                <th className="py-3 px-5">Staff Member</th>
                                <th className="py-3 px-4">Base Rate / Salary</th>
                                <th className="py-3 px-4">Logged Hours</th>
                                <th className="py-3 px-4">Gross Compensation</th>
                                <th className="py-3 px-4">Status</th>
                                <th className="py-3 px-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin mx-auto mb-2" />
                                        <span className="text-xs font-medium">Loading payroll records...</span>
                                    </td>
                                </tr>
                            ) : paginatedLedger.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-slate-400">
                                        <p className="text-xs font-medium">No personnel found in current ledger</p>
                                    </td>
                                </tr>
                            ) : (
                                paginatedLedger.map((item) => (
                                    <tr key={item.employee._id} className="hover:bg-slate-50/70 transition-colors">
                                        <td className="py-3.5 px-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0 overflow-hidden">
                                                    {item.employee.photoUrl ? (
                                                        <img
                                                            src={getFullImageUrl(item.employee.photoUrl) || ''}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <span>{item.employee.firstName?.[0]}{item.employee.lastName?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 text-xs sm:text-sm">
                                                        {item.employee.firstName} {item.employee.lastName}
                                                    </div>
                                                    <div className="text-[11px] text-slate-400 font-mono">
                                                        {item.employee.position || 'Staff'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                                            ${item.baseSalary || 500}
                                        </td>

                                        <td className="py-3.5 px-4 font-mono text-slate-600">
                                            {item.workedHours || 160} hrs
                                        </td>

                                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                                            ${item.netPayable || item.baseSalary || 500}
                                        </td>

                                        <td className="py-3.5 px-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                item.status === 'paid'
                                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                            }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                <span className="capitalize">{item.status || 'Pending'}</span>
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-5 text-right">
                                            <div className="inline-flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedPayslip(item)}
                                                    className="p-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                                    title="View Payslip"
                                                >
                                                    <FileText size={14} />
                                                </button>
                                                {item.status !== 'paid' && (
                                                    <button
                                                        onClick={() => handleSingleDisburse(item.employee._id)}
                                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs"
                                                    >
                                                        Pay
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Deposit Modal */}
            <AnimatePresence>
                {showDepositModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <h3 className="text-base font-bold text-slate-900">Deposit Reserve Capital</h3>
                                <button
                                    onClick={() => setShowDepositModal(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <form onSubmit={handleDeposit} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-700">Deposit Amount ($ USD)</label>
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        placeholder="e.g. 5000"
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-blue-500 font-mono transition-colors"
                                    />
                                </div>

                                <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-700 leading-relaxed">
                                    Funds deposited will be credited to the primary ABA PayWay clearing balance and instantly available for disbursements.
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDepositModal(false)}
                                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isDepositing}
                                        className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs shadow-xs transition-colors disabled:opacity-50"
                                    >
                                        {isDepositing ? 'Processing...' : 'Confirm Deposit'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Payslip Modal */}
            <AnimatePresence>
                {selectedPayslip && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden p-6 space-y-4"
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">Official Payslip Statement</h3>
                                    <p className="text-xs text-slate-400">Campus Attendance Payroll Engine</p>
                                </div>
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-500 font-medium">Employee Name:</span>
                                    <span className="font-bold text-slate-900">
                                        {selectedPayslip.employee.firstName} {selectedPayslip.employee.lastName}
                                    </span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-500 font-medium">Designation:</span>
                                    <span className="font-bold text-slate-900">{selectedPayslip.employee.position || 'Staff'}</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                                    <span className="text-slate-500 font-medium">Logged Working Hours:</span>
                                    <span className="font-bold text-slate-900 font-mono">{selectedPayslip.workedHours || 160} hrs</span>
                                </div>
                                <div className="flex justify-between p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm">
                                    <span>Total Net Payable:</span>
                                    <span className="font-mono">${selectedPayslip.netPayable || selectedPayslip.baseSalary || 500}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={() => setSelectedPayslip(null)}
                                    className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                                >
                                    Close Statement
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
