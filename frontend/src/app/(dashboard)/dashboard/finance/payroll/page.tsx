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
    Zap
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
        { label: 'Owner Executive Vault', value: `$${(stats.masterBalance || 0).toLocaleString()}`, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10', trend: 'Master Fund' },
        { label: 'Disbursed', value: `$${stats.disbursed.toLocaleString()}`, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: 'Secured' },
        { label: 'Payroll Expense', value: `$${stats.totalPayroll.toLocaleString()}`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: 'Monthly Burn' },
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

        // ABA Batch Format: Debit Account, Credit Account, Amount, Currency, Remark, Beneficiary Name
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
        <div className="space-y-8 pb-12">
            <div className="print:hidden space-y-8">
                {/* Header Area */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 mb-2">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Secured Transaction Environment</span>
                        </div>
                        <h1 className="text-4xl font-black text-white tracking-tight italic">Payroll Liquidity</h1>
                        <p className="text-slate-400 font-medium tracking-tight">Enterprise fund distribution and compensation analytics</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowBankSettings(true)}
                            className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/5 text-slate-400 hover:text-white transition-all border border-white/10"
                            title="Bank Connectivity"
                        >
                            <ShieldCheck className={`w-5 h-5 ${bankDetails.accountNumber ? 'text-emerald-400' : 'text-slate-500'}`} />
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={refreshing}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-slate-400 font-black text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10 uppercase"
                        >
                            {refreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                            Generate Cycle
                        </button>
                        <button
                            onClick={() => setShowDepositModal(true)}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-indigo-400 font-black text-xs tracking-widest hover:bg-white/10 transition-all border border-indigo-500/20 uppercase"
                        >
                            <PlusCircle className="w-4 h-4" />
                            Deposit Funds
                        </button>
                        <button
                            onClick={handleApprove}
                            disabled={isApproving}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-amber-400 font-black text-xs tracking-widest hover:bg-white/10 transition-all border border-amber-500/20 uppercase"
                        >
                            {isApproving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                            Approve Cycle
                        </button>
                        <button
                            onClick={handleDisburse}
                            disabled={isDisbursing}
                            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-blue-600 text-white font-black text-xs tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/30 active:scale-95 disabled:opacity-50 uppercase italic"
                        >
                            {isDisbursing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                            Execute Multi-Pay
                        </button>
                    </div>

                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, index) => (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            key={index}
                            className="glass-pane p-6 rounded-3xl border border-white/10 relative group hover:border-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/5"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} border border-white/5`}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</span>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-emerald-400">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {stat.trend}
                                    </div>
                                </div>
                            </div>
                            <div className="text-3xl font-black text-white tracking-tight">{stat.value}</div>
                        </motion.div>
                    ))}
                </div>


                {/* Main Ledger */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-pane rounded-[2.5rem] border border-white/10 overflow-hidden"
                >
                    <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20 text-blue-400">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-lg font-black text-white uppercase tracking-widest italic">Compensation Ledger</h2>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Cycle: February 2026</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Ledger..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-slate-950/50 border border-white/5 text-white pl-11 pr-4 py-3 rounded-2xl outline-none focus:border-blue-500/50 transition-all w-64 text-[10px] font-black uppercase tracking-[0.2em] placeholder:text-slate-700"
                                />
                            </div>
                            <button
                                onClick={handleDownloadCSV}
                                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                title="Export to CSV"
                            >
                                <Download className="w-5 h-5" />
                            </button>
                            <button
                                onClick={handleExportABA}
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-600/10 border border-indigo-500/30 rounded-2xl text-indigo-400 hover:bg-indigo-600/20 transition-all font-black text-[10px] uppercase tracking-widest"
                                title="Export ABA iBusiness Batch"
                            >
                                <CreditCard className="w-4 h-4" />
                                ABA Batch
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] lg:min-w-full">
                            <thead>
                                <tr className="bg-white/[0.01]">
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel Agent</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Base Compensation</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Compliance Score</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Bank Destination</th>
                                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Entity Status</th>
                                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Protocol</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.02]">
                                {loading ? (
                                    [1, 2, 3].map(i => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-8 py-10">
                                                <div className="h-12 bg-white/5 rounded-2xl w-full" />
                                            </td>
                                        </tr>
                                    ))
                                ) : paginatedLedger.map((item, index) => (
                                    <tr key={item.employee._id} className="hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 overflow-hidden shadow-2xl">
                                                        {item.employee.photoUrl ? (
                                                            <img
                                                                src={getFullImageUrl(item.employee.photoUrl)}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                alt=""
                                                            />
                                                        ) : <UserCircle className="w-full h-full text-slate-700 p-2" />}
                                                    </div>
                                                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)] 
                                                    ${item.payroll.status === 'disbursed' ? 'bg-emerald-500' :
                                                            item.payroll.status === 'approved' ? 'bg-blue-500' :
                                                                'bg-amber-500'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white leading-tight mb-0.5">{item.employee.firstName} {item.employee.lastName}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.employee.position || 'Specialist'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-sm font-black text-white">${item.payroll.baseAmount.toLocaleString()}.00</p>
                                                {item.payroll.deductions > 0 && (
                                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-tighter">
                                                        -${item.payroll.deductions.toFixed(2)} (Late: ${item.payroll.lateDeductions || 0})
                                                    </p>
                                                )}
                                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Final Compensation</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-white">{item.employee.bankDetails?.bankName || 'CASH'}</p>
                                                <p className="text-[9px] font-bold text-slate-500 font-mono">{item.employee.bankDetails?.accountNumber || 'Manual execution'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 max-w-[100px] h-1.5 rounded-full bg-white/5 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${item.payroll.complianceScore}%` }}
                                                        transition={{ duration: 1, delay: index * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                                                    />
                                                </div>
                                                <span className="text-[10px] font-black text-slate-400">{item.payroll.complianceScore}%</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 
                                                ${item.payroll.status === 'disbursed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                                                        item.payroll.status === 'approved' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                                                            'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse 
                                                    ${item.payroll.status === 'disbursed' ? 'bg-emerald-400' :
                                                            item.payroll.status === 'approved' ? 'bg-blue-400' :
                                                                'bg-amber-400'}`} />
                                                    {item.payroll.status === 'disbursed' ? 'Verified' :
                                                        item.payroll.status === 'approved' ? 'Approved' :
                                                            'Pending'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => handleViewPayslip(item)}
                                                className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                                title="View Payslip"
                                            >
                                                <FileText className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}

                            </tbody>
                        </table>
                    </div>

                    {/* Footer Controls */}
                    <div className="p-8 bg-white/[0.01] border-t border-white/5 flex items-center justify-between">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">Ledger contains {filteredLedger.length} unique financial entities</p>

                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold text-slate-500 uppercase">Page {currentPage} of {Math.max(1, totalPages)}</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={handlePrevPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-slate-400 text-xs font-black uppercase transition-all"
                                >
                                    Prev
                                </button>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage >= totalPages}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-slate-400 text-xs font-black uppercase transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Deposit Modal */}
            {showDepositModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-md glass-pane p-8 rounded-[2rem] border border-white/10 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowDepositModal(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-8">
                            <div className="w-14 h-14 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-6">
                                <PlusCircle className="w-7 h-7" />
                            </div>
                            <h2 className="text-2xl font-black text-white italic">Top Up Executive Vault</h2>
                            <p className="text-slate-400 text-sm font-medium mt-1 uppercase tracking-tight">Injection of Business Capital</p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Deposit Amount (USD)</label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-indigo-400 opacity-50">$</div>
                                    <input
                                        type="number"
                                        placeholder="0.00"
                                        value={depositAmount}
                                        onChange={(e) => setDepositAmount(e.target.value)}
                                        autoFocus
                                        className="w-full bg-slate-950/50 border border-white/5 text-white pl-12 pr-6 py-5 rounded-2xl outline-none focus:border-indigo-500/50 transition-all text-2xl font-black"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleDeposit}
                                disabled={isDepositing || !depositAmount}
                                className="w-full py-5 rounded-2xl bg-indigo-600 text-white font-black text-xs tracking-[0.2em] hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] disabled:opacity-50 uppercase italic flex items-center justify-center gap-3"
                            >
                                {isDepositing ? <RefreshCw className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                Initialize Deposit Protocol
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* Bank Settings Modal */}
            {showBankSettings && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-lg glass-pane p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative"
                    >
                        <button
                            onClick={() => setShowBankSettings(false)}
                            className="absolute top-6 right-6 p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="mb-10">
                            <h2 className="text-2xl font-black text-white italic mb-2">Corporate Bank Link</h2>
                            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Configuring ABA / Acleda Merchant Gateway</p>
                        </div>

                        <div className="space-y-6">
                            <div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 mb-8">
                                <div className="flex items-start gap-4">
                                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                                    <p className="text-xs text-emerald-200/70 font-medium leading-relaxed">
                                        These credentials are used to generate the **Debit Account** column in your bank batch files. Ensure they match your Corporate iBusiness profile.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Company Account Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. ARI ICU TECH LTD"
                                        value={bankDetails.accountName}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-bold uppercase tracking-wider"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Corporate Account Number</label>
                                    <input
                                        type="text"
                                        placeholder="000 000 000"
                                        value={bankDetails.accountNumber}
                                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                                        className="w-full bg-slate-950/50 border border-white/5 text-white px-6 py-4 rounded-2xl outline-none focus:border-blue-500/50 transition-all font-mono text-xl"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleSaveBankSettings}
                                className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-xs tracking-[0.2em] hover:bg-blue-500 transition-all shadow-xl shadow-blue-500/20 active:scale-[0.98] uppercase italic mt-4"
                            >
                                Synchronize Bank Protocol
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
            {/* Payslip Modal */}
            {showPayslipModal && selectedPayslip && (
                <div id="payslip-modal" className="fixed inset-0 z-[110] flex items-center justify-center p-0 md:p-4 bg-slate-950/90 backdrop-blur-xl animate-in fade-in duration-300 print:absolute print:inset-0 print:z-[200] print:p-0 print:bg-white print:backdrop-blur-none transition-all">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="w-full max-w-2xl h-full md:h-auto md:max-h-[90vh] bg-slate-900 md:rounded-[2.5rem] border-x border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-hidden relative flex flex-col print:shadow-none print:border-none print:rounded-none print:max-w-none print:h-auto print:max-h-none print:bg-white"
                    >
                        {/* Header controls (Hidden on print) */}
                        <div className="p-4 md:p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between print:hidden shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
                                    <FileText size={18} />
                                </div>
                                <h2 className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest italic truncate">Electronic Payslip Receipt</h2>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.print()}
                                    className="px-3 md:px-4 py-2 bg-blue-600 rounded-xl text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-blue-500 transition-all flex items-center gap-2"
                                >
                                    <Download size={14} className="hidden sm:block" />
                                    PDF
                                </button>
                                <button
                                    onClick={() => setShowPayslipModal(false)}
                                    className="p-2 rounded-xl bg-white/5 text-slate-500 hover:text-white transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Payslip Content (Optimized for both screen and print) */}
                        <div id="payslip-content" className="flex-1 overflow-y-auto md:overflow-y-visible p-6 md:p-12 space-y-8 md:space-y-12 bg-white text-slate-950 print:p-0 print:overflow-visible custom-scrollbar">
                            {/* Watermark branding */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b-4 border-slate-900 pb-8 print:items-center print:text-center print:justify-center">
                                <div className="space-y-4 print:flex print:flex-col print:items-center">
                                    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-950 rounded-2xl flex items-center justify-center shadow-2xl">
                                        <span className="text-white font-black text-xl md:text-2xl">AI</span>
                                    </div>
                                    <div>
                                        <h1 className="text-xl md:text-2xl font-black italic tracking-tighter text-slate-900">ARI ICU TECH LTD</h1>
                                        <p className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em]">Quantum Systems Division</p>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right space-y-1 w-full sm:w-auto print:text-center print:mt-4">
                                    <div className="px-3 py-1 bg-slate-950 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block mb-2 md:mb-4">Official Payment Record</div>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400">Transaction ID: <span className="text-slate-900">{selectedPayslip.payroll.transactionId || 'PENDING'}</span></p>
                                    <p className="text-[9px] md:text-[10px] font-bold text-slate-400">Cycle: <span className="text-slate-900">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span></p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 print:text-center">
                                <div className="space-y-4 md:space-y-6">
                                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 print:border-none">Personnel Entity</h3>
                                    <div className="space-y-1">
                                        <p className="text-lg md:text-xl font-black text-slate-900 leading-tight">{selectedPayslip.employee.firstName} {selectedPayslip.employee.lastName}</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-wider">{selectedPayslip.employee.position || 'Specialist'}</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 mt-2 truncate">ID: {selectedPayslip.employee._id}</p>
                                    </div>
                                </div>
                                <div className="space-y-4 md:space-y-6">
                                    <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 print:border-none">Financial Destination</h3>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900">{selectedPayslip.employee.bankDetails?.bankName || 'Direct Cash Disbursement'}</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 font-mono truncate">{selectedPayslip.employee.bankDetails?.accountNumber || '---'}</p>
                                        <p className="text-[10px] md:text-[11px] font-bold text-slate-500 truncate">{selectedPayslip.employee.bankDetails?.accountName || '---'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 md:space-y-8">
                                <h3 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 print:border-none print:text-center">Computation Ledger</h3>
                                <div className="space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="font-bold text-slate-600">Base Compensation Protocol</span>
                                        <span className="font-black text-slate-900">${selectedPayslip.payroll.baseAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="font-bold text-slate-600">Neural Efficiency Bonus</span>
                                        <span className="font-black text-emerald-600">+${(selectedPayslip.payroll.bonus || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs md:text-sm">
                                        <span className="font-bold text-slate-600">Attendance Deductions</span>
                                        <span className="font-black text-rose-600">-${(selectedPayslip.payroll.deductions || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 md:pt-6 border-t-2 border-slate-900 flex justify-between items-center gap-4 print:flex-col print:text-center print:justify-center">
                                        <div className="space-y-1 grow">
                                            <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Liquidity Released</p>
                                            <p className="text-2xl md:text-3xl font-black text-slate-950 italic tracking-tighter">USD ${selectedPayslip.payroll.netAmount.toFixed(2)}</p>
                                        </div>
                                        <div className="hidden sm:block shrink-0">
                                            <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-100 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center opacity-50">
                                                <Zap size={24} className="text-slate-300" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-8 md:pt-12 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 items-end print:flex print:flex-col print:items-center print:text-center">
                                <div className="space-y-4 md:space-y-6 print:flex print:flex-col print:items-center">
                                    <div className="w-24 md:w-32 h-1 bg-slate-900" />
                                    <p className="text-[7px] md:text-[8px] font-black text-slate-400 uppercase tracking-[0.2em]">Authorized Digital Signature</p>
                                </div>
                                <div className="text-left sm:text-right print:text-center print:mt-4">
                                    <p className="text-[7px] md:text-[8px] font-bold text-slate-300 uppercase leading-relaxed max-w-[200px] sm:ml-auto print:mx-auto">
                                        This document is an electronic representation of salary disbursement and is strictly confidential. Generated by Quantum Core Intelligence.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
