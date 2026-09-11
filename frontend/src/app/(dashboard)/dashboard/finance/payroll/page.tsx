'use client';

import { useState, useEffect } from 'react';
import {
    CreditCard,
    Wallet,
    Banknote,
    Clock,
    Search,
    Download,
    ArrowUpRight,
    DollarSign,
    FileText,
    TrendingUp,
    ShieldCheck,
    RefreshCw,
    UserCircle,
    Briefcase,
    PlusCircle,
    X,
    Zap,
    ChevronLeft,
    ChevronRight,
    RotateCcw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Employee } from '@/types/employee.types';
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

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };

    const statCards = [
        { label: 'Executive Vault', value: `$${(stats.masterBalance || 0).toLocaleString()}`, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: 'Master Fund' },
        { label: 'Disbursed Funds', value: `$${stats.disbursed.toLocaleString()}`, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'Paid Out' },
        { label: 'Payroll Expense', value: `$${stats.totalPayroll.toLocaleString()}`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'Monthly Total' },
        { label: 'Owner Residual', value: `$${(stats.ownerResidual || 0).toLocaleString()}`, icon: Wallet, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: 'Remaining' },
    ];

    const handleDisburse = async () => {
        try {
            setIsDisbursing(true);
            await PayrollService.disburse();
            toast.success('Funds released for approved entities');
            fetchData();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Disbursement failed');
        } finally {
            setIsDisbursing(false);
        }
    };

    const handleApprove = async () => {
        try {
            setIsApproving(true);
            await PayrollService.approve();
            toast.success('Cycle methodology validated and approved');
            fetchData();
        } catch (err) {
            toast.error('Approval sequence failed');
        } finally {
            setIsApproving(false);
        }
    };

    const handleDeposit = async () => {
        const amount = parseFloat(depositAmount);
        if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');

        try {
            setIsDepositing(true);
            await PayrollService.deposit(amount, 'Business Owner Capital Top-up');
            toast.success(`Funded Executive Vault with $${amount.toLocaleString()}`);
            setShowDepositModal(false);
            setDepositAmount('');
            fetchData();
        } catch (err) {
            toast.error('Deposit sequence failed');
        } finally {
            setIsDepositing(false);
        }
    };

    const handleGenerate = async () => {
        try {
            setRefreshing(true);
            await PayrollService.generate();
            toast.success('Generated payroll for current cycle');
            fetchData();
        } catch (err) {
            toast.error('Generation failed');
        } finally {
            setRefreshing(false);
        }
    };

    const handleDownloadCSV = () => {
        if (filteredLedger.length === 0) return toast.error('No data to export');

        const headers = ['Employee ID', 'Name', 'Position', 'Dept', 'Monthly Base', 'Hourly Rate', 'Hours', 'Net Pay', 'Compliance', 'Status', 'Bank Name', 'Account No', 'Account Name', 'Date', 'TXID'];

        const formatCSVRow = (arr: (string | number)[]) => {
            return arr.map(val => {
                const s = String(val ?? '');
                return s.includes(',') || s.includes('"') || s.includes('\n')
                    ? `"${s.replace(/"/g, '""')}"`
                    : s;
            }).join(',');
        };

        const rows = filteredLedger.map(item => [
            item.employee._id,
            `${item.employee.firstName} ${item.employee.lastName}`,
            item.employee.position || 'N/A',
            item.employee.department || 'N/A',
            item.payroll.baseAmount || 0,
            item.employee.hourlyRate || 0,
            item.payroll.totalHours || 0,
            item.payroll.netAmount,
            `${item.payroll.complianceScore || 0}%`,
            item.payroll.status?.toUpperCase() || 'PENDING',
            item.employee.bankDetails?.bankName || 'N/A',
            item.employee.bankDetails?.accountNumber || '---',
            item.employee.bankDetails?.accountName || '---',
            item.payroll.paymentDate ? new Date(item.payroll.paymentDate).toLocaleDateString('en-US', { timeZone: 'Asia/Phnom_Penh' }) : 'N/A',
            item.payroll.transactionId || '---'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => formatCSVRow(row))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const dateStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Phnom_Penh' });
        link.setAttribute('download', `payroll_ledger_${dateStr}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Financial ledger exported');
    };

    const handleExportABA = () => {
        if (!bankDetails.accountNumber) {
            toast.error('Configure Company Bank Account first');
            setShowBankSettings(true);
            return;
        }

        const approvedOnly = ledger.filter(item => item.payroll.status === 'approved' || item.payroll.status === 'disbursed');
        if (approvedOnly.length === 0) return toast.error('No approved payroll to export');

        const headers = ['Debit Account', 'Credit Account', 'Amount', 'Currency', 'Remark', 'Beneficiary Name'];

        const rows = approvedOnly.map(item => [
            bankDetails.accountNumber,
            item.employee.bankDetails?.accountNumber || '',
            item.payroll.netAmount,
            'USD',
            `Salary ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
            item.employee.bankDetails?.accountName || `${item.employee.firstName} ${item.employee.lastName}`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.setAttribute('href', URL.createObjectURL(blob));
        link.setAttribute('download', `ABA_PAYROLL_BATCH_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
        toast.success('ABA iBusiness Batch generated');
    };

    const handleSaveBankSettings = async () => {
        try {
            await PayrollService.updateCompanyBank(bankDetails);
            toast.success('Corporate bank credentials synchronized');
            setShowBankSettings(false);
        } catch (err) {
            toast.error('Sync failed');
        }
    };

    const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
    const [showPayslipModal, setShowPayslipModal] = useState(false);

    const handleViewPayslip = (item: any) => {
        setSelectedPayslip(item);
        setShowPayslipModal(true);
    };

    return (
        <div className="space-y-6 pb-12">
            <div className="print:hidden space-y-6">
                {/* Header Area */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Payroll & Financial Management</h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1">Enterprise salary disbursement, balance tracking, and ledger records</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            onClick={() => setShowBankSettings(true)}
                            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                            title="Bank Settings"
                        >
                            <ShieldCheck className={`w-4 h-4 ${bankDetails.accountNumber ? 'text-emerald-400' : 'text-slate-400'}`} />
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={refreshing}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
                        >
                            {refreshing ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                            Generate Cycle
                        </button>
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-xs font-semibold border border-indigo-500/30 transition-colors"
                        >
                            <PlusCircle className="w-3.5 h-3.5" />
                            Deposit Funds
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 text-xs font-semibold border border-amber-500/30 transition-colors disabled:opacity-50"
                        >
                            {isApproving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                            Approve
                        </button>
                        <button
                            onClick={handleDisburse}
                            disabled={isDisbursing}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
                        >
                            {isDisbursing ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                            Disburse
                        </button>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-slate-900 border border-slate-800 p-5 rounded-2xl"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                                    {stat.trend}
                                </span>
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                            <div className="text-xs text-slate-400 mt-1">{stat.label}</div>
                        </div>
                    ))}
                </div>

                {/* Main Ledger */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950/40">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                <Wallet className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-sm sm:text-base font-bold text-white">Compensation Ledger</h2>
                                <p className="text-xs text-slate-400">Payroll cycle breakdown</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search by name..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-950 border border-slate-800 text-slate-100 pl-9 pr-3 py-1.5 rounded-xl outline-none focus:border-blue-500 transition-colors w-48 sm:w-60 text-xs"
                                />
                            </div>
                            <button
                                onClick={handleDownloadCSV}
                                className="p-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
                                title="Export to CSV"
                            >
                                <Download className="w-4 h-4" />
                            </button>
                            <button
                                onClick={handleExportABA}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-300 hover:bg-indigo-600/30 transition-colors text-xs font-semibold"
                                title="Export ABA Batch"
                            >
                                <CreditCard className="w-3.5 h-3.5" />
                                ABA
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">
                            <thead>
                                <tr className="bg-slate-950/60 border-b border-slate-800">
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Employee</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Base Pay</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Bank Details</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Compliance</th>
                                    <th className="px-5 py-3.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">Status</th>
                                    <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Payslip</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={6} className="px-5 py-4">
                                                <div className="h-10 bg-slate-800 rounded-lg w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : paginatedLedger.map((item) => (
                                    <tr key={item.employee._id} className="hover:bg-slate-800/40 transition-colors">
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-slate-400 font-semibold text-xs">
                                                    {item.employee.photoUrl ? (
                                                        <img
                                                            src={getFullImageUrl(item.employee.photoUrl)}
                                                            className="w-full h-full object-cover"
                                                            alt=""
                                                        />
                                                    ) : <UserCircle className="w-5 h-5 text-slate-400" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm font-semibold text-white">{item.employee.firstName} {item.employee.lastName}</p>
                                                    <p className="text-[11px] text-slate-400">{item.employee.position || 'Specialist'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="space-y-0.5">
                                                <p className="text-xs sm:text-sm font-semibold text-white">${item.payroll.baseAmount?.toLocaleString() || 0}.00</p>
                                                {item.payroll.deductions > 0 && (
                                                    <p className="text-[10px] text-rose-400 font-medium">
                                                        -${item.payroll.deductions.toFixed(2)} deductions
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="space-y-0.5 text-xs">
                                                <p className="font-semibold text-slate-200">{item.employee.bankDetails?.bankName || 'CASH'}</p>
                                                <p className="text-slate-400 font-mono text-[11px]">{item.employee.bankDetails?.accountNumber || 'Manual Execution'}</p>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                                                    <div
                                                        style={{ width: `${item.payroll.complianceScore || 0}%` }}
                                                        className="h-full bg-blue-500"
                                                    />
                                                </div>
                                                <span className="text-xs font-semibold text-slate-300">{item.payroll.complianceScore || 0}%</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold capitalize border ${
                                                item.payroll.status === 'disbursed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                item.payroll.status === 'approved' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                'bg-amber-500/10 border-amber-500/20 text-amber-400'
                                            }`}>
                                                {item.payroll.status === 'disbursed' ? 'Disbursed' :
                                                item.payroll.status === 'approved' ? 'Approved' : 'Pending'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={() => handleViewPayslip(item)}
                                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                                title="View Payslip"
                                            >
                                                <FileText className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <span>Showing {filteredLedger.length} entities</span>

                        <div className="flex items-center gap-2">
                            <span>Page {currentPage} of {Math.max(1, totalPages)}</span>
                            <div className="flex gap-1">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages}
                                    className="p-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg text-slate-300 transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowDepositModal(false)}
                            className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-white">Deposit Business Funds</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Top-up company master liquidity vault</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Deposit Amount (USD)</label>
                                <div className="relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        autoFocus
                                        className="w-full bg-slate-950 border border-slate-800 text-white pl-8 pr-4 py-2.5 rounded-xl outline-none focus:border-blue-500 transition-colors text-lg font-bold"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDeposit}
                                disabled={isDepositing || !depositAmount}
                                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isDepositing ? <RotateCcw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                Confirm Deposit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bank Settings Modal */}
            {showBankSettings && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative">
                        <button
                            onClick={() => setShowBankSettings(false)}
                            className="absolute top-5 right-5 p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="mb-6">
                            <h2 className="text-lg font-bold text-white">Company Bank Credentials</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Used for ABA / Acleda batch exports</p>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Company Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. ARI ICU TECH LTD"
                                    value={bankDetails.accountName}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors text-xs sm:text-sm font-medium uppercase"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400">Corporate Account Number</label>
                                <input
                                    type="text"
                                    placeholder="000 000 000"
                                    value={bankDetails.accountNumber}
                                    onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                    className="w-full bg-slate-950 border border-slate-800 text-white px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors font-mono text-sm"
                                />
                            </div>

                            <button
                                onClick={handleSaveBankSettings}
                                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm transition-colors shadow-sm mt-2"
                            >
                                Save Bank Credentials
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Payslip Modal */}
            {showPayslipModal && selectedPayslip && (
                <div id="payslip-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:absolute print:inset-0 print:p-0 print:bg-white print:backdrop-blur-none">
                    <div className="w-full max-w-xl bg-slate-900 rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col print:border-none print:shadow-none print:bg-white">
                        {/* Header controls (Hidden on print) */}
                        <div className="p-4 border-b border-slate-800 bg-slate-950/40 flex items-center justify-between print:hidden">
                            <div className="flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-blue-400" />
                                <h2 className="text-sm font-bold text-white">Payslip Receipt</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
                                >
                                    <Download size={13} />
                                    Print / PDF
                                </button>
                                <button
                                    onClick={() => setShowPayslipModal(false)}
                                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Payslip Content */}
                        <div id="payslip-content" className="p-6 md:p-8 space-y-6 bg-white text-slate-950 print:p-0">
                            <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                                <div>
                                    <h1 className="text-xl font-bold tracking-tight text-slate-950">ARI ICU TECH LTD</h1>
                                    <p className="text-xs text-slate-500">Salary Disbursement Slip</p>
                                </div>
                                <div className="text-right text-xs">
                                    <p className="font-semibold text-slate-900">ID: {selectedPayslip.payroll.transactionId || 'PENDING'}</p>
                                    <p className="text-slate-500">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Employee</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedPayslip.employee.firstName} {selectedPayslip.employee.lastName}</p>
                                    <p className="text-slate-500">{selectedPayslip.employee.position || 'Specialist'}</p>
                                </div>
                                <div>
                                    <p className="text-slate-400 uppercase font-semibold text-[10px]">Bank / Account</p>
                                    <p className="text-sm font-bold text-slate-900 mt-0.5">{selectedPayslip.employee.bankDetails?.bankName || 'Cash Disbursement'}</p>
                                    <p className="text-slate-500 font-mono">{selectedPayslip.employee.bankDetails?.accountNumber || '---'}</p>
                                </div>
                            </div>

                            <div className="border-t border-slate-200 pt-4 space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Base Salary</span>
                                    <span className="font-semibold text-slate-900">${(selectedPayslip.payroll.baseAmount || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Bonus & Performance</span>
                                    <span className="font-semibold text-emerald-600">+${(selectedPayslip.payroll.bonus || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-600">Attendance Deductions</span>
                                    <span className="font-semibold text-rose-600">-${(selectedPayslip.payroll.deductions || 0).toFixed(2)}</span>
                                </div>
                                <div className="pt-3 border-t-2 border-slate-900 flex justify-between items-baseline">
                                    <span className="font-bold text-slate-950 text-sm">Net Pay Released</span>
                                    <span className="text-xl font-bold text-slate-950">USD ${(selectedPayslip.payroll.netAmount || 0).toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

