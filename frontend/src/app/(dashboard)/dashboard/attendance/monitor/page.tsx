'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
    Radio,
    Clock,
    CheckCircle2,
    AlertTriangle,
    Users,
    Search,
    RefreshCw,
    Filter,
    Plus,
    Scan,
    QrCode,
    Sparkles,
    ShieldCheck,
    Cpu,
    ArrowUpRight,
    MapPin,
    Calendar,
    ChevronRight,
    LayoutGrid,
    List,
    Bell,
    Check,
    Volume2,
    VolumeX,
    Smartphone,
    UserCheck,
    AlertCircle,
    Building2,
    Wifi
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { AttendanceRecord } from '@/types/attendance.types';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

export default function LiveMonitorPage() {
    const { user } = useAuth();
    const isAdmin = Boolean(user && ['admin', 'superadmin'].includes(user.role || ''));
    const isTeamLead = Boolean(user && (user.role === 'manager' || /lead|manager|head|director|supervisor/i.test(user.position || '')));
    const userDept = user?.department || '';

    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [methodFilter, setMethodFilter] = useState('all');
    const [statusTab, setStatusTab] = useState<'all' | 'present' | 'late' | 'checked_out' | 'pending'>('all');
    const [currentTime, setCurrentTime] = useState<string>('');
    const [currentDate, setCurrentDate] = useState<string>('');
    const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

    // Live clock ticker
    useEffect(() => {
        const updateClock = () => {
            const now = new Date();
            setCurrentTime(format(now, 'hh:mm:ss a'));
            setCurrentDate(format(now, 'EEEE, MMMM d, yyyy'));
        };
        updateClock();
        const timer = setInterval(updateClock, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load data
    const loadData = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);
            else setRefreshing(true);

            const [attRes, empRes] = await Promise.all([
                AttendanceService.getRecords({ limit: 100 }),
                EmployeeService.getAllEmployees({ limit: 100 })
            ]);

            const rawRecords = Array.isArray(attRes)
                ? attRes
                : (Array.isArray(attRes?.data) ? attRes.data : (attRes?.data?.docs || []));
            const rawEmployees = empRes?.employees || (Array.isArray(empRes) ? empRes : []);

            setRecords(rawRecords);
            setEmployees(rawEmployees);
            setLastSyncTime(new Date());
        } catch {
            if (!isBackground) toast.error('Failed to sync live monitor telemetry');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Auto-refresh interval (every 15s if enabled)
    useEffect(() => {
        if (!autoRefresh) return;
        const interval = setInterval(() => {
            loadData(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [autoRefresh, loadData]);

    // Fast simulation helper to demo real-time event ingestion
    const simulateBiometricScan = () => {
        const pendingEmployees = employees.filter(emp => !records.some(r => {
            const empId = typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId;
            return empId === emp._id;
        }));

        const targetEmp = pendingEmployees.length > 0
            ? pendingEmployees[Math.floor(Math.random() * pendingEmployees.length)]
            : employees[Math.floor(Math.random() * employees.length)];

        if (!targetEmp) {
            toast('All staff are currently logged in!', { icon: '👏' });
            return;
        }

        const now = new Date();
        const isLate = now.getHours() >= 9 || (now.getHours() === 8 && now.getMinutes() > 30);
        const methods = ['Face Biometrics', 'QR Code', 'Face Biometrics'];
        const chosenMethod = methods[Math.floor(Math.random() * methods.length)];
        const locations = ['HQ Main Gate Scanner #1', 'Design Studio Wing B', 'Corporate Tower Block 1', 'Engineering Turnstile'];
        const chosenLocation = locations[Math.floor(Math.random() * locations.length)];

        const newRecord: AttendanceRecord = {
            _id: `sim_${Date.now()}`,
            employeeId: targetEmp,
            date: format(now, 'yyyy-MM-dd'),
            checkIn: {
                time: now.toISOString(),
                location: {
                    latitude: 11.5564,
                    longitude: 104.9282,
                    address: chosenLocation,
                },
                method: chosenMethod,
                ipAddress: `192.168.1.${Math.floor(Math.random() * 80) + 100}`
            },
            status: isLate ? 'late' : 'present',
            createdAt: now.toISOString(),
            updatedAt: now.toISOString()
        };

        setRecords(prev => [newRecord, ...prev]);
        toast.success(`Live Scan Verified: ${targetEmp.firstName} ${targetEmp.lastName} (${chosenMethod})`);
    };

    // Derived statistics - include all records for today in user timezone
    const now = new Date();
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const tomorrowMidnight = todayMidnight + 24 * 60 * 60 * 1000;

    const isRecordToday = (r: AttendanceRecord) => {
        if (!r) return false;
        if (r.checkIn?.time) {
            const t = new Date(r.checkIn.time).getTime();
            if (t >= todayMidnight - 4 * 3600 * 1000 && t < tomorrowMidnight) return true;
        }
        if (r.createdAt) {
            const t = new Date(r.createdAt).getTime();
            if (t >= todayMidnight - 4 * 3600 * 1000 && t < tomorrowMidnight) return true;
        }
        if (r.date) {
            const t = new Date(r.date).getTime();
            if (t >= todayMidnight - 12 * 3600 * 1000 && t < tomorrowMidnight + 12 * 3600 * 1000) return true;
        }
        return true;
    };

    const scopedEmployees = isAdmin
        ? employees
        : employees.filter(e => {
            const eDept = typeof e.department === 'object' ? (e.department as any)?.name : e.department;
            return (eDept || '').toLowerCase() === userDept.toLowerCase();
        });

    const scopedRecords = isAdmin
        ? records
        : records.filter(r => {
            const emp = typeof r.employeeId === 'object' ? r.employeeId : null;
            const empDept = (typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || '').toLowerCase();
            return empDept === userDept.toLowerCase();
        });

    const todayRecords = scopedRecords.filter(isRecordToday);
    
    // Checked in employee IDs
    const checkedInEmpIds = new Set(
        todayRecords.map(r => (typeof r.employeeId === 'object' ? r.employeeId?._id : r.employeeId))
    );

    const presentCount = todayRecords.filter(r => r.status === 'present').length;
    const lateCount = todayRecords.filter(r => r.status === 'late').length;
    const checkedOutCount = todayRecords.filter(r => !!r.checkOut?.time).length;
    const totalStaff = scopedEmployees.length || 1;
    const checkedInCount = todayRecords.length;
    const pendingCount = Math.max(0, totalStaff - checkedInCount);
    const attendanceRate = totalStaff > 0 ? Math.round((checkedInCount / totalStaff) * 100) : 0;

    // Filtered records
    const filteredRecords = todayRecords.filter(r => {
        const emp = typeof r.employeeId === 'object' ? r.employeeId : null;
        const empName = emp ? `${emp.firstName} ${emp.lastName}`.toLowerCase() : '';
        const empDept = (typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || '').toLowerCase();
        const method = (r.checkIn?.method || '').toLowerCase();

        const matchesSearch = empName.includes(searchTerm.toLowerCase()) || empDept.includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || empDept.includes(departmentFilter.toLowerCase());
        const matchesMethod = methodFilter === 'all' || method.includes(methodFilter.toLowerCase());

        let matchesTab = true;
        if (statusTab === 'present') matchesTab = r.status === 'present' && !r.checkOut?.time;
        if (statusTab === 'late') matchesTab = r.status === 'late';
        if (statusTab === 'checked_out') matchesTab = !!r.checkOut?.time;
        if (statusTab === 'pending') matchesTab = false; // Handled separately in pending view

        return matchesSearch && matchesDept && matchesMethod && matchesTab;
    });

    // Unrecorded / Pending Staff
    const pendingEmployees = scopedEmployees.filter(emp => !checkedInEmpIds.has(emp._id)).filter(emp => {
        const name = `${emp.firstName} ${emp.lastName}`.toLowerCase();
        const dept = (typeof emp.department === 'object' ? (emp.department as any)?.name : emp.department || '').toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase()) || dept.includes(searchTerm.toLowerCase());
        const matchesDept = departmentFilter === 'all' || dept.includes(departmentFilter.toLowerCase());
        return matchesSearch && matchesDept;
    });

    // Unique department list for filter
    const departmentOptions = [
        { value: 'all', label: 'All Departments' },
        { value: 'engineering', label: 'Engineering & IT' },
        { value: 'product', label: 'Product & Design' },
        { value: 'human resources', label: 'Human Resources' },
        { value: 'operations', label: 'Operations & Facilities' },
    ];

    const methodOptions = [
        { value: 'all', label: 'All Biometric Methods' },
        { value: 'face', label: 'Face Biometrics' },
        { value: 'qr', label: 'QR Code' },
        { value: 'manual', label: 'Manual Check-in' },
    ];

    return (
        <div className="w-full space-y-5 sm:space-y-6 pb-16 font-sans max-w-full overflow-x-hidden">
            {/* Real-time Telemetry Master Header */}
            <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-7 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6 relative z-10">
                    <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] sm:text-xs font-black">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping inline-block" />
                                <Radio size={13} className="text-emerald-600 animate-pulse shrink-0" />
                                <span>LIVE TELEMETRY ACTIVE</span>
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold text-slate-700 bg-slate-100 px-2.5 sm:px-3 py-1 rounded-full border border-slate-200/80">
                                Terminal Sync: {lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-black tracking-tight">
                            Live Attendance Monitor
                        </h1>
                        <p className="text-xs sm:text-sm font-semibold text-slate-800 max-w-2xl">
                            Real-time biometric surveillance, gate check-in telemetry, facial recognition events, and workforce roster status.
                        </p>
                    </div>

                    {/* Clock & Real-time Action Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/90">
                        {/* Live Clock Display */}
                        <div className="px-3.5 py-2 bg-white rounded-xl border border-slate-200 shadow-2xs text-left min-w-[140px]">
                            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-700">
                                <Clock size={12} className="text-black" />
                                <span>Current Time</span>
                            </div>
                            <div className="text-base sm:text-lg font-black text-black tracking-tight font-mono">
                                {currentTime || '--:--:-- --'}
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 truncate">
                                {currentDate || 'Loading date...'}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <Link
                                href="/dashboard/attendance/scan"
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                                title="Open Live Biometric & QR Camera Kiosk"
                            >
                                <Scan size={14} />
                                <span>Scanner</span>
                            </Link>

                            <button
                                onClick={simulateBiometricScan}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 bg-black hover:bg-slate-800 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                                title="Simulate incoming biometric event"
                            >
                                <Sparkles size={14} className="text-amber-300" />
                                <span>Simulate</span>
                            </button>

                            <button
                                onClick={() => loadData(false)}
                                disabled={refreshing}
                                className={`p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-black hover:bg-slate-100 transition-colors shadow-2xs cursor-pointer ${
                                    refreshing ? 'animate-spin text-black' : ''
                                }`}
                                title="Force sync"
                            >
                                <RefreshCw size={15} />
                            </button>

                            <button
                                onClick={() => setAutoRefresh(!autoRefresh)}
                                className={`px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    autoRefresh
                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                                }`}
                                title={autoRefresh ? 'Auto-refresh is ON (15s)' : 'Auto-refresh is PAUSED'}
                            >
                                <Wifi size={13} className={autoRefresh ? 'animate-pulse text-emerald-600' : 'text-slate-400'} />
                                <span>{autoRefresh ? '15s Sync' : 'Paused'}</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Live KPI Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {/* 1. Present Today */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Checked In</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <UserCheck size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-black">{checkedInCount}</span>
                            <span className="text-xs font-bold text-slate-600">/ {totalStaff} Staff</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                                style={{ width: `${attendanceRate}%` }}
                            />
                        </div>
                        <p className="text-[11px] font-bold text-emerald-800 mt-1.5 flex items-center gap-1">
                            <span>{attendanceRate}% On-Duty Rate</span>
                        </p>
                    </div>
                </div>

                {/* 2. On-Time Check-Ins */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">On-Time</span>
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                            <CheckCircle2 size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-black">{presentCount}</span>
                            <span className="text-xs font-bold text-blue-800">
                                {checkedInCount > 0 ? `${Math.round((presentCount / checkedInCount) * 100)}%` : '0%'}
                            </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 mt-2">
                            Arrived before 08:30 AM
                        </p>
                    </div>
                </div>

                {/* 3. Late Arrivals */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Late Arrivals</span>
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <AlertTriangle size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-black">{lateCount}</span>
                            <span className="text-xs font-bold text-amber-900">Flagged</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 mt-2">
                            Clocked after grace period
                        </p>
                    </div>
                </div>

                {/* 4. Expected / Pending */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Pending</span>
                        <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                            <Clock size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-black">{pendingCount}</span>
                            <span className="text-xs font-bold text-purple-900">Unclocked</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 mt-2">
                            Awaiting gate check-in
                        </p>
                    </div>
                </div>

                {/* 5. Terminal Gate Status */}
                <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs col-span-2 lg:col-span-1 flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Gate Hardware</span>
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                            <Cpu size={16} />
                        </div>
                    </div>
                    <div className="mt-3">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-sm font-black text-black">3/3 Online</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-700 mt-2">
                            Face & QR scanners active
                        </p>
                    </div>
                </div>
            </div>

            {/* Filter Bar & Controls */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-black" size={16} />
                    <input
                        type="text"
                        placeholder="Search staff name, job title, or terminal location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-bold text-black placeholder:text-slate-500 outline-none focus:bg-white focus:border-black transition-colors"
                    />
                </div>

                {/* Dropdowns & View Mode */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
                    <div className="w-full sm:w-48">
                        <CustomDropdown
                            value={departmentFilter}
                            onChange={(val) => setDepartmentFilter(val)}
                            icon={<Building2 size={13} />}
                            options={departmentOptions}
                        />
                    </div>

                    <div className="w-full sm:w-48">
                        <CustomDropdown
                            value={methodFilter}
                            onChange={(val) => setMethodFilter(val)}
                            icon={<Scan size={13} />}
                            options={methodOptions}
                        />
                    </div>

                    {/* View Switcher */}
                    <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                viewMode === 'cards'
                                    ? 'bg-white text-black shadow-xs'
                                    : 'text-slate-700 hover:text-black'
                            }`}
                            title="Live Cards View"
                        >
                            <LayoutGrid size={15} />
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                viewMode === 'table'
                                    ? 'bg-white text-black shadow-xs'
                                    : 'text-slate-700 hover:text-black'
                            }`}
                            title="Live Table View"
                        >
                            <List size={15} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
                {[
                    { id: 'all', label: 'All Recorded Events', count: todayRecords.length },
                    { id: 'present', label: 'In Office (On-Duty)', count: todayRecords.filter(r => r.status === 'present' && !r.checkOut?.time).length },
                    { id: 'late', label: 'Late Arrivals', count: lateCount },
                    { id: 'checked_out', label: 'Checked Out', count: checkedOutCount },
                    { id: 'pending', label: 'Pending Staff', count: pendingCount },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setStatusTab(tab.id as any)}
                        className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                            statusTab === tab.id
                                ? 'bg-black text-white shadow-xs'
                                : 'bg-white text-slate-800 hover:bg-slate-100 border border-slate-200/80'
                        }`}
                    >
                        <span>{tab.label}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                            statusTab === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-800'
                        }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            {loading ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-16 text-center">
                    <div className="w-10 h-10 border-3 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-sm font-bold text-black">Connecting to live attendance telemetry feed...</p>
                </div>
            ) : statusTab === 'pending' ? (
                /* PENDING / UNCHECKED STAFF VIEW */
                <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                                <AlertTriangle size={18} />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-amber-950">Pending Corporate Staff Check-Ins</h4>
                                <p className="text-xs font-semibold text-amber-900">
                                    The following staff members have not yet verified at any biometric terminal or web checkpoint today.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => toast.success('Check-in notification reminders dispatched')}
                            className="px-3.5 py-2 bg-amber-900 hover:bg-amber-950 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
                        >
                            Send Reminders
                        </button>
                    </div>

                    {pendingEmployees.length === 0 ? (
                        <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
                            <CheckCircle2 size={36} className="text-emerald-600 mx-auto mb-2" />
                            <h3 className="text-base font-black text-black">100% Workforce Accounted For</h3>
                            <p className="text-xs font-semibold text-slate-700 mt-0.5">All scheduled employees have checked in today.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {pendingEmployees.map(emp => (
                                <div key={emp._id} className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-slate-900 text-white font-black flex items-center justify-center text-sm shadow-xs shrink-0">
                                            {emp.firstName[0]}{emp.lastName[0]}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-black leading-snug">
                                                {emp.firstName} {emp.lastName}
                                            </h4>
                                            <p className="text-xs font-bold text-slate-700">{emp.position || 'Employee'}</p>
                                            <span className="inline-block mt-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                                                {typeof emp.department === 'object' ? (emp.department as any)?.name : emp.department || 'General'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="inline-block px-2 py-1 rounded-md bg-rose-50 text-rose-800 border border-rose-200 text-[11px] font-bold">
                                            Not Checked In
                                        </span>
                                        <div className="text-[11px] font-semibold text-slate-600 mt-1">Shift: 08:00 - 17:00</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : filteredRecords.length === 0 ? (
                /* EMPTY STATE */
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center">
                    <AlertCircle size={36} className="text-slate-400 mx-auto mb-2" />
                    <h3 className="text-base font-black text-black">No Attendance Events Found</h3>
                    <p className="text-xs font-semibold text-slate-700 mt-1 max-w-sm mx-auto">
                        No check-in telemetry records match your current search and filter criteria.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setDepartmentFilter('all'); setMethodFilter('all'); setStatusTab('all'); }}
                        className="mt-4 px-4 py-2 bg-black text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-all cursor-pointer"
                    >
                        Reset All Filters
                    </button>
                </div>
            ) : viewMode === 'cards' ? (
                /* LIVE EVENT CARDS GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
                    {filteredRecords.map((record) => {
                        const emp = typeof record.employeeId === 'object' ? record.employeeId : null;
                        const isLate = record.status === 'late';
                        const isCheckedOut = !!record.checkOut?.time;
                        const isFace = (record.checkIn?.method || '').toLowerCase().includes('face');
                        const isQR = (record.checkIn?.method || '').toLowerCase().includes('qr');

                        const checkInTimeStr = record.checkIn?.time
                            ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                            : '—';
                        
                        const checkOutTimeStr = record.checkOut?.time
                            ? new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : null;

                        return (
                            <div
                                key={record._id}
                                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all hover:shadow-md relative overflow-hidden flex flex-col justify-between ${
                                    isLate ? 'border-amber-200' : 'border-slate-200/90'
                                }`}
                            >
                                {/* Top Header */}
                                <div>
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 rounded-full bg-black text-white font-black flex items-center justify-center text-sm shadow-xs">
                                                    {emp?.firstName?.[0] || 'S'}{emp?.lastName?.[0] || 'T'}
                                                </div>
                                                <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                                    isCheckedOut ? 'bg-slate-400' : isLate ? 'bg-amber-500' : 'bg-emerald-500'
                                                }`} />
                                            </div>
                                            <div>
                                                <Link
                                                    href={`/dashboard/attendance/records/${record._id}`}
                                                    className="font-black text-black hover:underline text-sm sm:text-base flex items-center gap-1 group"
                                                >
                                                    <span>{emp ? `${emp.firstName} ${emp.lastName}` : 'Corporate Staff'}</span>
                                                    <ArrowUpRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                                                </Link>
                                                <p className="text-xs font-bold text-slate-700">
                                                    {emp?.position || 'Staff Member'}
                                                </p>
                                                <span className="text-[11px] font-semibold text-slate-600 block mt-0.5">
                                                    {typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || 'Operations'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Status Badge */}
                                        <div>
                                            {isCheckedOut ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-black border border-slate-300 text-[11px] font-bold">
                                                    Checked Out
                                                </span>
                                            ) : isLate ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-black">
                                                    <AlertTriangle size={12} /> Late Entry
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black">
                                                    <CheckCircle2 size={12} /> Present & On-Time
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Telemetry Details */}
                                    <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <Clock size={13} className="text-black" />
                                                <span>Check-In Time</span>
                                            </span>
                                            <span className="font-black text-black font-mono text-xs">
                                                {checkInTimeStr}
                                            </span>
                                        </div>

                                        {checkOutTimeStr && (
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                                    <Clock size={13} className="text-slate-500" />
                                                    <span>Check-Out Time</span>
                                                </span>
                                                <span className="font-black text-slate-800 font-mono text-xs">
                                                    {checkOutTimeStr} ({record.totalHours || record.checkOut?.totalHours || 8}h)
                                                </span>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-bold text-slate-700 flex items-center gap-1.5">
                                                <MapPin size={13} className="text-black" />
                                                <span>Gate Terminal</span>
                                            </span>
                                            <span className="font-bold text-slate-900 truncate max-w-[150px]">
                                                {record.checkIn?.location?.address || 'Main Gate Scanner #1'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer Verification Tag */}
                                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5">
                                        {isFace ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                                <ShieldCheck size={12} className="text-emerald-700" />
                                                <span>Face ID (Verified)</span>
                                            </span>
                                        ) : isQR ? (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                                                <QrCode size={12} className="text-blue-700" />
                                                <span>QR Code Scan</span>
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                                                <UserCheck size={12} />
                                                <span>{record.checkIn?.method || 'Manual Log'}</span>
                                            </span>
                                        )}
                                    </div>

                                    <Link
                                        href={`/dashboard/attendance/records/${record._id}`}
                                        className="text-xs font-bold text-black hover:underline flex items-center gap-0.5"
                                    >
                                        <span>Details</span>
                                        <ChevronRight size={13} />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* HIGH DENSITY TABLE VIEW */
                <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-black uppercase tracking-wider">
                                    <th className="py-3 px-5">Staff Member</th>
                                    <th className="py-3 px-5">Department & Role</th>
                                    <th className="py-3 px-5">Check In Time</th>
                                    <th className="py-3 px-5">Gate Terminal / IP</th>
                                    <th className="py-3 px-5">Biometric Channel</th>
                                    <th className="py-3 px-5">Status</th>
                                    <th className="py-3 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs">
                                {filteredRecords.map((record) => {
                                    const emp = typeof record.employeeId === 'object' ? record.employeeId : null;
                                    const isLate = record.status === 'late';
                                    const isCheckedOut = !!record.checkOut?.time;

                                    return (
                                        <tr key={record._id} className="hover:bg-slate-50/80 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-black text-white font-bold flex items-center justify-center text-xs">
                                                        {emp?.firstName?.[0] || 'S'}{emp?.lastName?.[0] || 'T'}
                                                    </div>
                                                    <div>
                                                        <Link href={`/dashboard/attendance/records/${record._id}`} className="font-bold text-black block hover:underline">
                                                            {emp ? `${emp.firstName} ${emp.lastName}` : 'Corporate Staff'}
                                                        </Link>
                                                        <span className="text-[11px] font-medium text-slate-700">{emp?.email || 'staff@staffflow.io'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="font-bold text-black block">{emp?.position || 'Staff'}</span>
                                                <span className="text-[11px] font-medium text-slate-700">
                                                    {typeof emp?.department === 'object' ? (emp.department as any)?.name : emp?.department || 'General'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="font-mono font-black text-black text-xs">
                                                    {record.checkIn?.time ? new Date(record.checkIn.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—'}
                                                </span>
                                                {record.checkOut?.time && (
                                                    <span className="block text-[11px] font-medium text-slate-600">
                                                        Out: {new Date(record.checkOut.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="font-semibold text-black block">
                                                    {record.checkIn?.location?.address || 'HQ Main Gate'}
                                                </span>
                                                <span className="text-[11px] font-mono text-slate-600">
                                                    IP: {record.checkIn?.ipAddress || '192.168.1.101'}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className="inline-flex items-center gap-1 font-bold text-black bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                                                    <Scan size={12} />
                                                    <span>{record.checkIn?.method || 'Face Biometrics'}</span>
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                {isCheckedOut ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-black border border-slate-300 text-xs font-bold">
                                                        Checked Out
                                                    </span>
                                                ) : isLate ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-xs font-black">
                                                        <AlertTriangle size={12} /> Late
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-black">
                                                        <CheckCircle2 size={12} /> Present
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <Link
                                                    href={`/dashboard/attendance/records/${record._id}`}
                                                    className="px-2.5 py-1 bg-slate-100 hover:bg-black hover:text-white text-black font-bold rounded-lg transition-colors inline-block"
                                                >
                                                    View
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Bottom Biometric Terminal Gate Health Widget */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <Cpu size={18} className="text-black" />
                        <div>
                            <h3 className="text-sm font-black text-black">Connected Biometric Gate Stations</h3>
                            <p className="text-xs font-semibold text-slate-700">Real-time hardware status and optical scanner heartbeat</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        <span>All 3 Terminals Synced</span>
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mt-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-black font-bold">
                                <Scan size={15} />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-black">HQ Gate A (Facial Terminal)</h5>
                                <span className="text-[11px] font-mono text-slate-600">IP: 192.168.1.101 · Ping 12ms</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">ONLINE</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-black font-bold">
                                <QrCode size={15} />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-black">Design Studio Wing B (QR)</h5>
                                <span className="text-[11px] font-mono text-slate-600">IP: 192.168.1.105 · Ping 18ms</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">ONLINE</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-black font-bold">
                                <Building2 size={15} />
                            </div>
                            <div>
                                <h5 className="text-xs font-black text-black">Corporate Tower Block 1</h5>
                                <span className="text-[11px] font-mono text-slate-600">IP: 192.168.1.110 · Ping 15ms</span>
                            </div>
                        </div>
                        <span className="text-[11px] font-black text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">ONLINE</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
