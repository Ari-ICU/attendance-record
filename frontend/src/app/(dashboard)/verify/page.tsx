'use client'

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import VerifyWebcam from '@/components/verify/VerifyWebcam';
import VerifyCard from '@/components/verify/VerifyCard';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Fingerprint, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';
import Image from 'next/image';

export default function VerifyPage() {
    const params = useParams();
    const searchParams = useSearchParams();

    // Get employeeId from params or search query
    const employeeId = (params?.employeeId as string) || searchParams.get('id') || '';

    const [mode, setMode] = useState<'check-in' | 'check-out'>('check-in');
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState<any[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(employeeId);
    const [idData, setIdData] = useState({
        name: 'Awaiting ID...',
        idNumber: '---',
        dob: '---',
        expiry: '---',
        nationality: '---',
        photoUrl: '',
        position: '---',
        manager: '---',
    });
    const [searchTerm, setSearchTerm] = useState('');

    const filteredEmployees = employees.filter(emp =>
        `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.position?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const [empRes] = await Promise.all([
                    EmployeeService.getAllEmployees({ limit: 1000 })
                ]);
                setEmployees(empRes.employees || []);

                if (employeeId) {
                    const employee = empRes.employees?.find((e: any) => e._id === employeeId) ||
                        await EmployeeService.getEmployeeById(employeeId);
                    if (employee) {
                        setIdData({
                            name: `${employee.firstName} ${employee.lastName}`,
                            idNumber: employee._id,
                            dob: 'N/A',
                            expiry: 'N/A',
                            nationality: 'Cambodian',
                            photoUrl: employee.photoUrl || '',
                            position: employee.position,
                            manager: 'N/A',
                        });
                        setSelectedEmployeeId(employee._id);
                    }
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to initialize verification station');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, [employeeId]);

    const handleEmployeeSelect = (id: string) => {
        setSelectedEmployeeId(id);
        const employee = employees.find(e => e._id === id);
        if (employee) {
            setIdData({
                name: `${employee.firstName} ${employee.lastName}`,
                idNumber: employee._id,
                dob: 'N/A',
                expiry: 'N/A',
                nationality: 'Cambodian',
                photoUrl: employee.photoUrl || '',
                position: employee.position,
                manager: 'N/A',
            });
        }
    };

    return (
        <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full translate-y-1/2 pointer-events-none" />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 mb-6 group">
                        <ShieldCheck className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Secure Authentication</span>
                    </div>
                    <h1 className="text-4xl sm:text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-slate-500 tracking-tight leading-tight">
                        Smart Attendance
                    </h1>
                    <p className="mt-4 text-xl text-slate-400 max-w-2xl mx-auto font-medium tracking-tight">
                        Place your face within the frame to <span className="text-white">{mode === 'check-in' ? 'check in' : 'check out'}</span> and record your attendance.
                    </p>
                </motion.header>

                {/* Mode Selector */}
                <div className="flex justify-center mb-12">
                    <div className="p-1 px-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex gap-1">
                        <button
                            onClick={() => setMode('check-in')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${mode === 'check-in'
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Clock className="w-4 h-4" />
                            Check In
                        </button>
                        <button
                            onClick={() => setMode('check-out')}
                            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all text-sm uppercase tracking-widest ${mode === 'check-out'
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            Check Out
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-8 items-start">
                    {/* Directory Section */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3 order-3 lg:order-1"
                    >
                        <div className="glass-pane rounded-3xl p-6 border border-white/10 shadow-2xl bg-white/[0.02] h-[600px] flex flex-col">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <Users className="w-5 h-5 text-indigo-400" />
                                </div>
                                <h2 className="text-lg font-black text-white tracking-tight">Directory</h2>
                            </div>

                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search identity..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pl-11 pr-4 text-xs font-bold text-slate-300 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {filteredEmployees.length > 0 ? (
                                    filteredEmployees.map((emp) => (
                                        <button
                                            key={emp._id}
                                            onClick={() => handleEmployeeSelect(emp._id)}
                                            className={`w-full flex items-center gap-4 p-3 rounded-2xl border transition-all group ${selectedEmployeeId === emp._id
                                                ? 'bg-indigo-600/20 border-indigo-500/50'
                                                : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'
                                                }`}
                                        >
                                            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0 border border-white/10">
                                                {emp.photoUrl ? (
                                                    <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Fingerprint className="w-5 h-5 text-slate-600 absolute inset-0 m-auto" />
                                                )}
                                            </div>
                                            <div className="text-left overflow-hidden">
                                                <div className="text-[11px] font-black text-white truncate leading-tight group-hover:text-indigo-400 transition-colors">
                                                    {emp.firstName} {emp.lastName}
                                                </div>
                                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider truncate">
                                                    {emp.position}
                                                </div>
                                            </div>
                                        </button>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <ShieldCheck className="w-8 h-8 text-slate-700 mb-3" />
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">No target found</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Identification Card Section */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-4 order-2"
                    >
                        <div className="glass-pane rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <ShieldCheck className="w-24 h-24 text-white" />
                            </div>

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="p-3 bg-blue-500/10 rounded-2xl">
                                        <Fingerprint className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-white tracking-tight">Employee Identity</h2>
                                        <p className="text-slate-400 text-sm font-medium">Official biometric record</p>
                                    </div>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                                        <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                                        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing profile...</p>
                                    </div>
                                ) : (
                                    <VerifyCard
                                        name={idData.name}
                                        idNumber={idData.idNumber}
                                        photoUrl={idData.photoUrl}
                                        dob={idData.dob}
                                        expiry={idData.expiry}
                                        nationality={idData.nationality}
                                        position={idData.position}
                                        manager={idData.manager}
                                    />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Biometric Scanner Section */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 order-1 lg:order-3"
                    >
                        <div className="glass-pane rounded-3xl p-8 border border-white/10 shadow-2xl relative overflow-hidden bg-white/[0.02]">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-full max-w-md bg-slate-950/50 rounded-2xl overflow-hidden border border-white/5 shadow-inner relative group">
                                    <VerifyWebcam
                                        employeeId={selectedEmployeeId}
                                        mode={mode}
                                        onSuccess={(data) => {
                                            if (data.employee) {
                                                handleEmployeeSelect(data.employee._id);
                                            }
                                        }}
                                    />

                                    {/* Scanning Animation Overlays */}
                                    {selectedEmployeeId && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-blue-500 m-4 rounded-tl-xl opacity-50" />
                                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-blue-500 m-4 rounded-tr-xl opacity-50" />
                                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-blue-500 m-4 rounded-bl-xl opacity-50" />
                                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-blue-500 m-4 rounded-br-xl opacity-50" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 space-y-4 w-full">
                                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Scanner Status</span>
                                        <span className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-widest">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            Operational
                                        </span>
                                    </div>
                                    <p className="text-slate-500 text-xs font-medium px-4 leading-relaxed">
                                        By using this scanner, you consent to biometric processing for the purpose of attendance tracking and identification security.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </main>
    );
}