'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import VerifyWebcam from '@/components/verify/VerifyWebcam';
import VerifyCard from '@/components/verify/VerifyCard';
import { EmployeeService } from '@/services/employee.service';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Fingerprint, Search, ShieldCheck, UserCheck, Users } from 'lucide-react';

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
        name: 'Awaiting ID Scan...',
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
        <main className="min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-slate-50">
            <div className="w-full space-y-6">
                {/* Header Section */}
                <div className="text-center max-w-2xl mx-auto space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-semibold">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Biometric Authentication</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                        Smart Attendance Verification
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500">
                        Position your face inside the camera frame to record your <span className="text-slate-900 font-semibold">{mode === 'check-in' ? 'check in' : 'check out'}</span> timestamp.
                    </p>
                </div>

                {/* Mode Selector Buttons */}
                <div className="flex justify-center">
                    <div className="p-1 rounded-2xl bg-white border border-slate-200/80 flex gap-1 shadow-xs">
                        <button
                            onClick={() => setMode('check-in')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                                mode === 'check-in'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <Clock className="w-4 h-4" />
                            <span>Check In</span>
                        </button>
                        <button
                            onClick={() => setMode('check-out')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all text-xs sm:text-sm ${
                                mode === 'check-out'
                                    ? 'bg-indigo-600 text-white shadow-xs'
                                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                            }`}
                        >
                            <UserCheck className="w-4 h-4" />
                            <span>Check Out</span>
                        </button>
                    </div>
                </div>

                {/* 3-Column Bento Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Directory Section */}
                    <div className="lg:col-span-3 order-3 lg:order-1 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs h-[560px] flex flex-col">
                        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-slate-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Users className="w-4 h-4" />
                            </div>
                            <h2 className="text-sm font-bold text-slate-900">Student Directory</h2>
                        </div>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Filter student..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-8 pr-3 text-xs text-slate-800 placeholder-slate-400 outline-none focus:bg-white focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <button
                                        key={emp._id}
                                        onClick={() => handleEmployeeSelect(emp._id)}
                                        className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl border transition-all text-left ${
                                            selectedEmployeeId === emp._id
                                                ? 'bg-blue-50/80 border-blue-200 text-blue-900 shadow-2xs'
                                                : 'bg-white border-slate-200/70 hover:bg-slate-50 text-slate-700'
                                        }`}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-slate-700 font-bold text-xs">
                                            {emp.photoUrl ? (
                                                <img src={emp.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span>{emp.firstName?.[0]}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-bold text-slate-900 truncate">
                                                {emp.firstName} {emp.lastName}
                                            </div>
                                            <div className="text-[11px] text-slate-400 truncate">
                                                {emp.position || 'Student'}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400">
                                    <p className="text-xs font-medium">No students found</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Camera Biometric Scanner (Center) */}
                    <div className="lg:col-span-5 order-1 lg:order-2 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col items-center">
                        <div className="w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-inner relative">
                            <VerifyWebcam
                                employeeId={selectedEmployeeId}
                                mode={mode}
                                onIdentify={(employee) => {
                                    if (employee && employee._id !== selectedEmployeeId) {
                                        handleEmployeeSelect(employee._id);
                                        toast.success(`Identified: ${employee.firstName}`, { icon: '👤', duration: 2000 });
                                    }
                                }}
                                onSuccess={(data) => {
                                    if (data.employee) {
                                        handleEmployeeSelect(data.employee._id);
                                    }
                                }}
                            />
                        </div>

                        <div className="mt-4 space-y-2 w-full">
                            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
                                <span className="font-semibold text-slate-500">Camera Telemetry</span>
                                <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    Active & Calibrated
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Identification Badge Card (Right) */}
                    <div className="lg:col-span-4 order-2 lg:order-3 bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                        <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                <Fingerprint className="w-4 h-4" />
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-900">Student ID Credentials</h2>
                                <p className="text-xs text-slate-400">Biometric match card</p>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16 gap-2 text-slate-400">
                                <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-xs font-medium">Syncing credentials...</p>
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
            </div>
        </main>
    );
}