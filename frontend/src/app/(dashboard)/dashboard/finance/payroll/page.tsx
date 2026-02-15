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
    UserCircle
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

    const [stats, setStats] = useState({
        totalPayroll: 0,
        disbursed: 0,
        pending: 0,
        efficiency: 0
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
        { label: 'Total Payroll', value: `$${stats.totalPayroll.toLocaleString()}`, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '+4.2%' },
        { label: 'Disbursed', value: `$${stats.disbursed.toLocaleString()}`, icon: Banknote, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '82%' },
        { label: 'Pending Distribution', value: `$${stats.pending.toLocaleString()}`, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '18%' },
        { label: 'System Efficiency', value: `${stats.efficiency}%`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '+0.1%' },
    ];

    const handleDisburse = async () => {
        try {
            setIsDisbursing(true);
            await PayrollService.disburse();
            toast.success('Batch disbursement sequence completed');
            fetchData();
        } catch (err) {
            toast.error('Disbursement failed');
        } finally {
            setIsDisbursing(false);
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

        const headers = ['Employee ID', 'First Name', 'Last Name', 'Position', 'Department', 'Base Salary', 'Net Pay', 'Status', 'Payment Method'];
        const rows = filteredLedger.map(item => [
            item.employee._id,
            item.employee.firstName,
            item.employee.lastName,
            item.employee.position,
            item.employee.department || 'N/A',
            item.payroll.baseAmount,
            item.payroll.netAmount,
            item.payroll.status,
            item.payroll.paymentMethod
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payroll_ledger_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Ledger exported successfully');
    };

    const handleDownloadPayslip = (item: any) => {
        const content = `
            PAYSLIP RECEIPT
            --------------------------------------------------
            Employee: ${item.employee.firstName} ${item.employee.lastName}
            ID: ${item.employee._id}
            Position: ${item.employee.position}
            Department: ${item.employee.department || 'N/A'}
            Date: ${new Date().toLocaleDateString()}

            EARNINGS
            --------------------------------------------------
            Base Salary: $${item.payroll.baseAmount.toFixed(2)}
            Bonus:       $${(item.payroll.bonus || 0).toFixed(2)}
            --------------------------------------------------
            Gross Pay:   $${(item.payroll.baseAmount + (item.payroll.bonus || 0)).toFixed(2)}

            DEDUCTIONS
            --------------------------------------------------
            Tax/Deductions: $${(item.payroll.deductions || 0).toFixed(2)}

            NET PAY:     $${item.payroll.netAmount.toFixed(2)}
            --------------------------------------------------
            Status: ${item.payroll.status.toUpperCase()}
            Transaction ID: ${item.payroll.transactionId || 'PENDING'}
        `;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `payslip_${item.employee.firstName}_${item.employee.lastName}.txt`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Payslip for ${item.employee.firstName} downloaded`);
    };


    return (
        <div className="space-y-8 pb-12">
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
                        onClick={handleGenerate}
                        disabled={refreshing}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 text-slate-400 font-black text-xs tracking-widest hover:bg-white/10 transition-all border border-white/10 uppercase"
                    >
                        {refreshing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        Generate Cycle
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
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-white/[0.01]">
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Personnel Agent</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Base Compensation</th>
                                <th className="px-8 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Compliance Score</th>
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
                                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 shadow-[0_0_10px_rgba(16,185,129,0.5)] ${item.payroll.status === 'disbursed' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
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
                                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Gross Primary</p>
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
                                            <div className={`px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 ${item.payroll.status === 'disbursed' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${item.payroll.status === 'disbursed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                                {item.payroll.status === 'disbursed' ? 'Verified' : 'Pending'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <button
                                            onClick={() => handleDownloadPayslip(item)}
                                            className="p-2.5 rounded-xl bg-white/5 text-slate-500 hover:text-white hover:bg-white/10 transition-all active:scale-95"
                                            title="Download Payslip"
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
    );
}
