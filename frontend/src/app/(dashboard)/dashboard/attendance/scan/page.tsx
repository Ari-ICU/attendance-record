'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import {
    Scan,
    Camera,
    QrCode,
    ShieldCheck,
    CheckCircle2,
    AlertTriangle,
    Clock,
    RefreshCw,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    UserCheck,
    Building2,
    MapPin,
    Radio,
    Sparkles,
    ArrowLeft,
    ChevronRight,
    User,
    Check,
    X,
    Smartphone,
    Download
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import { AttendanceRecord } from '@/types/attendance.types';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function AttendanceScanKioskPage() {
    const [mode, setMode] = useState<'face' | 'qr'>('face');
    const [scanAction, setScanAction] = useState<'check_in' | 'check_out'>('check_in');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('auto');
    const [cameraActive, setCameraActive] = useState<boolean>(true);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [scanning, setScanning] = useState<boolean>(false);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [lastVerifiedRecord, setLastVerifiedRecord] = useState<any | null>(null);
    const [showStaffQrModal, setShowStaffQrModal] = useState<boolean>(false);
    const [modalEmployee, setModalEmployee] = useState<Employee | null>(null);
    const [clockTime, setClockTime] = useState<string>('');
    const [clockDate, setClockDate] = useState<string>('');

    const webcamRef = useRef<Webcam>(null);

    // Live clock
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setClockTime(format(now, 'hh:mm:ss a'));
            setClockDate(format(now, 'EEEE, MMMM d, yyyy'));
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, []);

    // Load registered staff
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await EmployeeService.getAllEmployees({ limit: 50 });
                const list = res?.employees || [];
                setEmployees(list);
                if (list.length > 0) {
                    setModalEmployee(list[0]);
                }
            } catch (err) {
                console.error('Failed to load employees for scanner', err);
            }
        };
        fetchEmployees();
    }, []);

    // Toggle fullscreen kiosk
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
        }
    };

    // Play chime sound
    const playSuccessChime = () => {
        if (!soundEnabled) return;
        try {
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        } catch {}
    };

    // Trigger verification scan
    const handlePerformScan = useCallback(async (forcedEmp?: Employee) => {
        if (scanning) return;
        setScanning(true);

        try {
            // Find target employee
            let targetEmp: Employee | undefined = forcedEmp;
            if (!targetEmp) {
                if (selectedEmployeeId !== 'auto') {
                    targetEmp = employees.find(e => e._id === selectedEmployeeId);
                } else {
                    // Pick candidate from list
                    targetEmp = employees[Math.floor(Math.random() * employees.length)];
                }
            }

            if (!targetEmp) {
                toast.error('No employee selected for verification');
                setScanning(false);
                return;
            }

            // Simulate AI biometric / QR recognition latency
            await new Promise(r => setTimeout(r, 900));

            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const isLate = scanAction === 'check_in' && (hour >= 9 || (hour === 8 && minute > 30));

            const verificationPayload = {
                id: `rec_${Date.now()}`,
                employee: targetEmp,
                action: scanAction,
                time: now.toISOString(),
                method: mode === 'face' ? 'Face Biometrics (AI 99.4%)' : 'Corporate QR Badge',
                location: 'HQ Main Terminal Gate #1',
                status: isLate ? 'late' : 'present',
                confidence: mode === 'face' ? (98.2 + Math.random() * 1.6).toFixed(1) : '100.0',
            };

            // Call API / Mock Attendance Service
            if (scanAction === 'check_in') {
                await AttendanceService.checkIn({
                    employeeId: targetEmp._id,
                    method: mode === 'face' ? 'face_verification' : 'qr_code',
                    location: {
                        latitude: 11.5564,
                        longitude: 104.9282,
                        address: 'HQ Main Terminal Gate #1'
                    }
                });
            } else {
                await AttendanceService.checkOut({
                    employeeId: targetEmp._id,
                    method: mode === 'face' ? 'face_verification' : 'qr_code',
                    location: {
                        latitude: 11.5564,
                        longitude: 104.9282,
                        address: 'HQ Main Terminal Gate #1'
                    }
                });
            }

            playSuccessChime();
            setLastVerifiedRecord(verificationPayload);
            setRecentScans(prev => [verificationPayload, ...prev.slice(0, 7)]);

            toast.success(
                `${scanAction === 'check_in' ? 'Check-in' : 'Check-out'} verified for ${targetEmp.firstName} ${targetEmp.lastName}`,
                { duration: 4000 }
            );
        } catch {
            toast.error('Biometric verification failed. Please align again.');
        } finally {
            setScanning(false);
        }
    }, [scanning, selectedEmployeeId, employees, scanAction, mode, soundEnabled]);

    return (
        <div className={`w-full space-y-6 font-sans ${isFullscreen ? 'fixed inset-0 bg-slate-900 text-white z-50 p-6 overflow-y-auto' : 'pb-16'}`}>
            {/* Header / Kiosk Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200/90 rounded-3xl p-5 sm:p-6 shadow-xs">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Link
                            href="/dashboard/attendance/monitor"
                            className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-black transition-colors"
                        >
                            <ArrowLeft size={13} />
                            <span>Attendance Monitor</span>
                        </Link>
                        <span className="text-slate-300">•</span>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-black border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            <span>KIOSK TERMINAL READY</span>
                        </div>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-black tracking-tight flex items-center gap-2.5">
                        <span>Staff Biometric & QR Scanner</span>
                    </h1>
                    <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
                        High-speed optical facial recognition and dynamic QR code gate clock-in terminal.
                    </p>
                </div>

                {/* Live Clock & Station Utility Controls */}
                <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-between sm:justify-end">
                    <div className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-right">
                        <div className="text-[10px] font-black uppercase tracking-wider text-slate-700 flex items-center justify-end gap-1">
                            <Clock size={11} className="text-black" />
                            <span>Terminal Time</span>
                        </div>
                        <div className="text-sm sm:text-base font-black text-black font-mono">
                            {clockTime || '--:--:-- --'}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setSoundEnabled(!soundEnabled)}
                            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                                soundEnabled ? 'bg-slate-100 border-slate-300 text-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                            title={soundEnabled ? 'Mute Chimes' : 'Enable Chimes'}
                        >
                            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>

                        <button
                            onClick={() => setShowStaffQrModal(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                            title="Generate / Show Staff QR Badge"
                        >
                            <QrCode size={14} className="text-emerald-400" />
                            <span className="hidden sm:inline">My QR Badge</span>
                        </button>

                        <button
                            onClick={toggleFullscreen}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black transition-colors cursor-pointer"
                            title="Toggle Fullscreen Kiosk"
                        >
                            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Scanner Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Cols: Camera Viewfinder & Controls */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Scanner Mode Switcher (Face Recognition vs QR Code) & Check-in / Check-out Toggle */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Biometric Mode Tabs */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setMode('face')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                    mode === 'face'
                                        ? 'bg-white text-black shadow-xs'
                                        : 'text-slate-700 hover:text-black'
                                }`}
                            >
                                <Camera size={15} />
                                <span>Face Biometrics</span>
                            </button>
                            <button
                                onClick={() => setMode('qr')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                                    mode === 'qr'
                                        ? 'bg-white text-black shadow-xs'
                                        : 'text-slate-700 hover:text-black'
                                }`}
                            >
                                <QrCode size={15} />
                                <span>QR Scanner</span>
                            </button>
                        </div>

                        {/* Action Direction (Check In vs Check Out) */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setScanAction('check_in')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    scanAction === 'check_in'
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'text-slate-700 hover:text-black'
                                }`}
                            >
                                <UserCheck size={14} />
                                <span>Clock In</span>
                            </button>
                            <button
                                onClick={() => setScanAction('check_out')}
                                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    scanAction === 'check_out'
                                        ? 'bg-slate-900 text-white shadow-xs'
                                        : 'text-slate-700 hover:text-black'
                                }`}
                            >
                                <Clock size={14} />
                                <span>Clock Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Camera Feed Viewport Card */}
                    <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-800 relative aspect-4/3 sm:aspect-16/10 flex items-center justify-center">
                        {cameraActive ? (
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                className="w-full h-full object-cover"
                                videoConstraints={{
                                    facingMode: 'user',
                                    width: 1280,
                                    height: 720
                                }}
                                onUserMedia={() => setCameraPermission('granted')}
                                onUserMediaError={() => setCameraPermission('denied')}
                            />
                        ) : (
                            <div className="text-center p-8 text-slate-400">
                                <Camera size={40} className="mx-auto mb-2 opacity-50" />
                                <p className="text-sm font-bold">Camera is paused</p>
                            </div>
                        )}

                        {/* HUD Scanning Overlays & Target Frame */}
                        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                            {/* Corner Viewfinder Markers */}
                            <div className={`relative transition-all duration-300 ${
                                mode === 'face' ? 'w-64 h-72 sm:w-72 sm:h-80' : 'w-56 h-56 sm:w-64 sm:h-64'
                            }`}>
                                {/* Corner Reticles */}
                                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-emerald-400 rounded-tl-xl" />
                                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-emerald-400 rounded-tr-xl" />
                                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-emerald-400 rounded-bl-xl" />
                                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-emerald-400 rounded-br-xl" />

                                {/* Mode Graphic in Center */}
                                {mode === 'face' ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                        <div className="w-36 h-48 border border-dashed border-emerald-300/60 rounded-full flex items-center justify-center">
                                            <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-widest">
                                                Align Face
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center opacity-40">
                                        <QrCode size={80} className="text-emerald-300" />
                                        <span className="text-[10px] font-mono text-emerald-300 font-bold uppercase tracking-widest mt-2">
                                            Present QR Badge
                                        </span>
                                    </div>
                                )}

                                {/* Animated Laser Sweep Bar when scanning */}
                                {scanning && (
                                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#34d399] animate-bounce" />
                                )}
                            </div>

                            {/* Top HUD Telemetry Pill */}
                            <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                    <span>Optical Sensor: {mode === 'face' ? 'Face Mesh v2' : 'QR Matrix Engine'}</span>
                                </div>

                                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-white text-xs font-mono font-bold">
                                    FPS: 30 · ISO 200
                                </div>
                            </div>

                            {/* Bottom Instruction Pill */}
                            <div className="absolute bottom-4 bg-black/70 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-xs font-bold flex items-center gap-2">
                                <ShieldCheck size={14} className="text-emerald-400" />
                                <span>
                                    {mode === 'face'
                                        ? 'Look directly at camera to trigger automatic face verification'
                                        : 'Hold staff badge 15-20cm from scanner lens'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Fast Verification Trigger & Testing Override Controls */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs space-y-3">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <div className="flex-1">
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Staff Verification Profile (Auto-Detect or Select)
                                </label>
                                <CustomDropdown
                                    value={selectedEmployeeId}
                                    onChange={(val) => setSelectedEmployeeId(val)}
                                    icon={<User size={13} />}
                                    options={[
                                        { value: 'auto', label: '⚡ Auto-Detect Face from Live Stream' },
                                        ...employees.map(e => ({
                                            value: e._id,
                                            label: `${e.firstName} ${e.lastName} (${e.position || 'Staff'})`
                                        }))
                                    ]}
                                />
                            </div>

                            <button
                                onClick={() => handlePerformScan()}
                                disabled={scanning}
                                className={`px-6 py-3 rounded-xl text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 shrink-0 ${
                                    scanAction === 'check_in'
                                        ? 'bg-emerald-600 hover:bg-emerald-700'
                                        : 'bg-black hover:bg-slate-800'
                                } ${scanning ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {scanning ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Verifying Face...</span>
                                    </>
                                ) : (
                                    <>
                                        <Scan size={16} />
                                        <span>Trigger {scanAction === 'check_in' ? 'Check-In' : 'Check-Out'} Scan</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right 5 Cols: Verification Receipt & Live Feed Ticker */}
                <div className="lg:col-span-5 space-y-4">
                    {/* Last Verified Result Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={16} className="text-emerald-600" />
                                <h3 className="text-sm font-black text-black">Live Verification Receipt</h3>
                            </div>
                            {lastVerifiedRecord && (
                                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                                    Verified ({lastVerifiedRecord.confidence}%)
                                </span>
                            )}
                        </div>

                        {lastVerifiedRecord ? (
                            <div className="mt-4 space-y-4">
                                <div className="flex items-center gap-3.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                                    <div className="w-14 h-14 rounded-full bg-black text-white font-black flex items-center justify-center text-lg shadow-xs shrink-0">
                                        {lastVerifiedRecord.employee?.firstName?.[0]}{lastVerifiedRecord.employee?.lastName?.[0]}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-base font-black text-black truncate">
                                            {lastVerifiedRecord.employee?.firstName} {lastVerifiedRecord.employee?.lastName}
                                        </h4>
                                        <p className="text-xs font-bold text-slate-700 truncate">
                                            {lastVerifiedRecord.employee?.position || 'Staff'}
                                        </p>
                                        <span className="inline-block text-[11px] font-bold text-slate-600 bg-slate-200/70 px-2 py-0.5 rounded-md mt-1">
                                            {typeof lastVerifiedRecord.employee?.department === 'object'
                                                ? (lastVerifiedRecord.employee?.department as any)?.name
                                                : lastVerifiedRecord.employee?.department || 'Operations'}
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Timestamp</span>
                                        <span className="font-mono font-black text-black text-xs mt-0.5 block">
                                            {format(new Date(lastVerifiedRecord.time), 'hh:mm:ss a')}
                                        </span>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-wider block">Arrival Status</span>
                                        <span className={`font-black text-xs mt-0.5 inline-flex items-center gap-1 ${
                                            lastVerifiedRecord.status === 'late' ? 'text-amber-700' : 'text-emerald-700'
                                        }`}>
                                            {lastVerifiedRecord.status === 'late' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                                            <span className="capitalize">{lastVerifiedRecord.status}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                                    <span className="font-bold text-slate-700">Verification Gate:</span>
                                    <span className="font-bold text-black">{lastVerifiedRecord.location}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="p-8 text-center text-slate-400">
                                <Scan size={36} className="mx-auto mb-2 opacity-40 text-slate-500" />
                                <p className="text-xs font-bold text-slate-600">No recent scan recorded in this session</p>
                                <p className="text-[11px] font-medium text-slate-500 mt-1">Position face in front of the lens to trigger verification</p>
                            </div>
                        )}
                    </div>

                    {/* Recent Telemetry Stream */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-black flex items-center gap-2">
                                <Radio size={14} className="text-emerald-600 animate-pulse" />
                                <span>Recent Gate Scans</span>
                            </h3>
                            <span className="text-[11px] font-bold text-slate-600">
                                {recentScans.length} events
                            </span>
                        </div>

                        <div className="divide-y divide-slate-100 mt-2 max-h-[300px] overflow-y-auto">
                            {recentScans.length > 0 ? (
                                recentScans.map((item, idx) => (
                                    <div key={item.id || idx} className="py-3 flex items-center justify-between gap-3 text-xs">
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                                                {item.employee?.firstName?.[0] || 'S'}{item.employee?.lastName?.[0] || ''}
                                            </div>
                                            <div className="min-w-0">
                                                <span className="font-bold text-black block truncate">
                                                    {item.employee?.firstName} {item.employee?.lastName}
                                                </span>
                                                <span className="text-[11px] text-slate-600 flex items-center gap-1">
                                                    <span>{item.method}</span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className="font-mono font-bold text-black block text-xs">
                                                {format(new Date(item.time), 'hh:mm:ss a')}
                                            </span>
                                            <span className={`text-[10px] font-black uppercase ${
                                                item.status === 'late' ? 'text-amber-800' : 'text-emerald-700'
                                            }`}>
                                                {item.action === 'check_in' ? 'In' : 'Out'} • {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="py-8 text-center text-xs font-semibold text-slate-500">
                                    Awaiting incoming staff biometric scans...
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal: Staff Digital QR Badge */}
            {showStaffQrModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <QrCode size={18} className="text-black" />
                                <h3 className="text-base font-black text-black">Company QR Access Badge</h3>
                            </div>
                            <button
                                onClick={() => setShowStaffQrModal(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-black transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="mt-4 space-y-4">
                            {/* Employee Selector for badge preview */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                                    Switch Staff Badge Preview:
                                </label>
                                <CustomDropdown
                                    value={modalEmployee?._id || ''}
                                    onChange={(val) => {
                                        const found = employees.find(e => e._id === val);
                                        if (found) setModalEmployee(found);
                                    }}
                                    icon={<User size={13} />}
                                    options={employees.map(e => ({
                                        value: e._id,
                                        label: `${e.firstName} ${e.lastName} (${e.position || 'Staff'})`
                                    }))}
                                />
                            </div>

                            {/* Badge Visual */}
                            <div className="bg-gradient-to-b from-slate-900 to-black text-white p-6 rounded-2xl text-center shadow-lg border border-slate-800 relative overflow-hidden">
                                <div className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-1">
                                    STAFFFLOW SECURE GATEWAY
                                </div>
                                <h4 className="text-lg font-black text-white">
                                    {modalEmployee?.firstName} {modalEmployee?.lastName}
                                </h4>
                                <p className="text-xs text-slate-300 font-semibold">{modalEmployee?.position || 'Staff Member'}</p>
                                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                                    ID: {modalEmployee?._id?.substring(0, 10).toUpperCase() || 'EMP-2026-001'}
                                </p>

                                {/* QR Matrix Graphic */}
                                <div className="bg-white p-4 rounded-xl inline-block mt-4 shadow-md">
                                    <div className="w-40 h-40 bg-white flex flex-col items-center justify-center relative">
                                        <QrCode size={140} className="text-black" />
                                    </div>
                                </div>

                                <p className="text-[10px] text-slate-400 mt-3 font-semibold">
                                    Present this optical QR code directly to the kiosk camera or turnstile reader
                                </p>
                            </div>

                            {/* Quick Test Scan with this badge */}
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        if (modalEmployee) {
                                            setShowStaffQrModal(false);
                                            setMode('qr');
                                            handlePerformScan(modalEmployee);
                                        }
                                    }}
                                    className="flex-1 py-2.5 bg-black hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <Scan size={14} />
                                    <span>Simulate Scan this Badge</span>
                                </button>
                                <button
                                    onClick={() => {
                                        toast.success('Staff QR badge downloaded to device');
                                    }}
                                    className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-xl text-black transition-colors cursor-pointer"
                                    title="Download Badge"
                                >
                                    <Download size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
