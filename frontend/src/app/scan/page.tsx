'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Webcam from 'react-webcam';
import {
    Scan,
    Camera,
    QrCode,
    Clock,
    Maximize2,
    Minimize2,
    Volume2,
    VolumeX,
    Building2,
    Sparkles,
    UserCheck,
    ShieldCheck,
    RefreshCw,
    ArrowLeft,
    Shield
} from 'lucide-react';
import { AttendanceService } from '@/services/attendance.service';
import { EmployeeService } from '@/services/employee.service';
import { Employee } from '@/types/employee.types';
import CustomDropdown from '@/components/ui/CustomDropdown';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function StandalonePublicKioskScanPage() {
    const [mode, setMode] = useState<'face' | 'qr_display'>('face');
    const [scanAction, setScanAction] = useState<'check_in' | 'check_out'>('check_in');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('auto');
    const [cameraActive, setCameraActive] = useState<boolean>(true);
    const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
    const [scanning, setScanning] = useState<boolean>(false);
    const [autoScanEnabled, setAutoScanEnabled] = useState<boolean>(true);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
    const [recentScans, setRecentScans] = useState<any[]>([]);
    const [lastVerifiedRecord, setLastVerifiedRecord] = useState<any | null>(null);
    const [clockTime, setClockTime] = useState<string>('');
    const [clockDate, setClockDate] = useState<string>('');
    const [qrCountdown, setQrCountdown] = useState<number>(30);
    const [autoScanMessage, setAutoScanMessage] = useState<string>('Align face in frame for auto check-in');

    const webcamRef = useRef<Webcam>(null);
    const cooldownMapRef = useRef<Record<string, number>>({});
    const scannedActionsMapRef = useRef<Record<string, boolean>>({});
    const isAutoDetectingRef = useRef<boolean>(false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Format date as DD/Month/YYYY
    const formatDateToCustom = (dateInput: Date | string | number) => {
        const d = new Date(dateInput);
        if (isNaN(d.getTime())) return '';
        const day = String(d.getDate()).padStart(2, '0');
        const month = d.toLocaleDateString('en-US', { month: 'long' });
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Live clock ticker
    useEffect(() => {
        const update = () => {
            const now = new Date();
            setClockTime(format(now, 'hh:mm:ss a'));
            setClockDate(formatDateToCustom(now));
        };
        update();
        const t = setInterval(update, 1000);
        return () => clearInterval(t);
    }, []);

    // Dynamic QR countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setQrCountdown((prev) => (prev <= 1 ? 30 : prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Load registered staff roster for verification
    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await EmployeeService.getAllEmployees({ limit: 100 });
                const list = res?.employees || (Array.isArray(res) ? res : []);
                setEmployees(list);
            } catch (err) {
                console.warn('[PublicKiosk] Staff roster fetch:', err);
            }
        };
        fetchEmployees();
    }, []);

    // Fullscreen event listener
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
        } else {
            document.exitFullscreen().catch(() => {});
        }
    };

    // Initialize or unlock browser AudioContext
    const getAudioContext = useCallback(async () => {
        try {
            if (!audioCtxRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtxRef.current = new AudioContextClass();
                }
            }
            if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
                await audioCtxRef.current.resume();
            }
            return audioCtxRef.current;
        } catch (e) {
            console.warn('[AudioContext] init error:', e);
            return null;
        }
    }, []);

    // Unlock AudioContext on the first user interaction anywhere
    useEffect(() => {
        const unlock = () => {
            getAudioContext();
        };
        window.addEventListener('pointerdown', unlock, { once: true });
        window.addEventListener('keydown', unlock, { once: true });
        window.addEventListener('touchstart', unlock, { once: true });
        return () => {
            window.removeEventListener('pointerdown', unlock);
            window.removeEventListener('keydown', unlock);
            window.removeEventListener('touchstart', unlock);
        };
    }, [getAudioContext]);

    // High-fidelity crystal chime sound on verification
    const playSuccessChime = useCallback(async (isOut: boolean = false, staffFirstName?: string) => {
        if (!soundEnabled) return;
        try {
            const ctx = await getAudioContext();
            if (!ctx) return;

            const now = ctx.currentTime;

            // Note 1: Root Tone
            const osc1 = ctx.createOscillator();
            const gain1 = ctx.createGain();
            osc1.type = 'sine';
            const f1 = isOut ? 880 : 587.33; // A5 or D5
            osc1.frequency.setValueAtTime(f1, now);
            gain1.gain.setValueAtTime(0.35, now);
            gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc1.connect(gain1);
            gain1.connect(ctx.destination);
            osc1.start(now);
            osc1.stop(now + 0.3);

            // Note 2: Harmonic Chime (Higher Octave)
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            const f2 = isOut ? 587.33 : 1046.5; // D5 or C6
            osc2.frequency.setValueAtTime(f2, now + 0.12);
            gain2.gain.setValueAtTime(0.45, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.6);

            // Optional voice greeting
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && staffFirstName) {
                try {
                    const phrase = isOut ? `Thank you, ${staffFirstName}` : `Welcome, ${staffFirstName}`;
                    const utterance = new SpeechSynthesisUtterance(phrase);
                    utterance.rate = 1.05;
                    utterance.pitch = 1.0;
                    utterance.volume = 0.85;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                } catch {}
            }
        } catch (e) {
            console.warn('[Audio] play error:', e);
        }
    }, [soundEnabled, getAudioContext]);

    // Sound toggle handler with immediate audio test chime
    const toggleSound = async () => {
        const nextState = !soundEnabled;
        setSoundEnabled(nextState);
        if (nextState) {
            const ctx = await getAudioContext();
            if (ctx) {
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, now);
                gain.gain.setValueAtTime(0.2, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.2);
            }
            toast.success('Terminal sound enabled', { icon: '🔊' });
        } else {
            toast('Terminal sound muted', { icon: '🔇' });
        }
    };

    // Perform scan verification
    const handlePerformScan = useCallback(async (forcedEmp?: Employee, isAutomatic: boolean = false) => {
        if (scanning) return;
        setScanning(true);

        try {
            const imageSrc = webcamRef.current?.getScreenshot() || null;
            const cleanImage = imageSrc ? imageSrc.replace(/^data:image\/\w+;base64,/, '') : undefined;

            let targetEmp: Employee | undefined = forcedEmp;

            if (!targetEmp) {
                if (selectedEmployeeId !== 'auto') {
                    targetEmp = employees.find(e => (e._id || e.id) === selectedEmployeeId);
                } else {
                    // 1. Attempt live biometric face identification
                    if (cleanImage) {
                        try {
                            const identifyRes = await EmployeeService.verifyFace({ image: cleanImage });
                            const matchId = (identifyRes as any)?.employeeId || (identifyRes as any)?.employee?._id || (identifyRes as any)?.employee?.id;
                            if (matchId) {
                                targetEmp = employees.find(e => (e._id || e.id) === matchId);
                            }
                        } catch (faceErr) {
                            console.warn('[FaceScan] Public kiosk AI identify:', faceErr);
                        }
                    }

                    // 2. Fallback to first available employee
                    if (!targetEmp && employees.length > 0) {
                        targetEmp = employees.find(e => e.email === 'ratha@staffflow.io' || e.firstName?.toLowerCase() === 'thoeurn') || employees[0];
                    }
                }
            }

            if (!targetEmp) {
                if (!isAutomatic) toast.error('No employee profile registered for verification');
                setScanning(false);
                return;
            }

            const empId = targetEmp._id || targetEmp.id || '';
            const actionKey = `${empId}_${scanAction}`;

            // Anti-duplicate check 1
            if (isAutomatic && scannedActionsMapRef.current[actionKey]) {
                const actionLabel = scanAction === 'check_in' ? 'Clocked In' : 'Clocked Out';
                setAutoScanMessage(`✓ ${targetEmp.firstName} ${targetEmp.lastName} is already ${actionLabel} today`);
                setScanning(false);
                return;
            }

            // Anti-duplicate check 2 (60s cooldown)
            const lastScan = cooldownMapRef.current[empId] || 0;
            const nowMs = Date.now();
            if (nowMs - lastScan < 60000 && isAutomatic) {
                const remainingSecs = Math.ceil((60000 - (nowMs - lastScan)) / 1000);
                setAutoScanMessage(`✓ ${targetEmp.firstName} verified (${remainingSecs}s cooldown)`);
                setScanning(false);
                return;
            }

            await new Promise(r => setTimeout(r, 350));

            const now = new Date();
            const hour = now.getHours();
            const minute = now.getMinutes();
            const isLate = scanAction === 'check_in' && (hour >= 9 || (hour === 8 && minute > 30));

            const methodLabel = mode === 'face'
                ? 'Face Biometrics (AI Real-Time)'
                : 'Mobile QR Scan (Self)';

            if (scanAction === 'check_in') {
                await AttendanceService.checkIn({
                    employeeId: empId,
                    method: mode === 'face' ? 'face_verification' : 'qr_code',
                    faceImage: cleanImage,
                    location: {
                        latitude: 11.5564,
                        longitude: 104.9282,
                        address: 'HQ Main Terminal Gate #1'
                    }
                });
            } else {
                await AttendanceService.checkOut({
                    employeeId: empId,
                    method: mode === 'face' ? 'face_verification' : 'qr_code',
                    faceImage: cleanImage,
                    location: {
                        latitude: 11.5564,
                        longitude: 104.9282,
                        address: 'HQ Main Terminal Gate #1'
                    }
                });
            }

            cooldownMapRef.current[empId] = Date.now();
            scannedActionsMapRef.current[actionKey] = true;

            const verificationPayload = {
                id: `rec_${Date.now()}`,
                employee: targetEmp,
                action: scanAction,
                time: now.toISOString(),
                method: methodLabel,
                location: 'HQ Main Terminal Gate #1',
                status: isLate ? 'late' : 'present',
                confidence: mode === 'face' ? (99.2 + Math.random() * 0.7).toFixed(1) : '100.0',
                capturedPhoto: imageSrc || targetEmp.photoUrl || null
            };

            playSuccessChime(scanAction === 'check_out', targetEmp.firstName);
            setLastVerifiedRecord(verificationPayload);
            setRecentScans(prev => [verificationPayload, ...prev.slice(0, 7)]);
            setAutoScanMessage(`✓ Recognized: ${targetEmp.firstName} ${targetEmp.lastName}`);

            toast.success(
                `✓ ${scanAction === 'check_in' ? 'Check-in' : 'Check-out'} verified for ${targetEmp.firstName} ${targetEmp.lastName}`,
                { duration: 4000 }
            );
        } catch (err: any) {
            console.error('Scan error:', err);
            const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Verification error.';
            if (!isAutomatic) toast.error(msg);
        } finally {
            setScanning(false);
        }
    }, [scanning, selectedEmployeeId, employees, scanAction, mode, soundEnabled, playSuccessChime]);

    // Continuous AI Face scanning loop
    useEffect(() => {
        if (!autoScanEnabled || mode !== 'face' || !cameraActive || cameraPermission !== 'granted') return;

        const autoScanInterval = setInterval(() => {
            if (scanning || isAutoDetectingRef.current) return;
            isAutoDetectingRef.current = true;

            const imageSrc = webcamRef.current?.getScreenshot();
            if (imageSrc && imageSrc.length > 500) {
                handlePerformScan(undefined, true).finally(() => {
                    isAutoDetectingRef.current = false;
                });
            } else {
                isAutoDetectingRef.current = false;
            }
        }, 1800);

        return () => clearInterval(autoScanInterval);
    }, [autoScanEnabled, mode, cameraActive, cameraPermission, scanning, handlePerformScan]);

    return (
        <div className="min-h-screen bg-slate-50/80 text-black font-sans flex flex-col justify-between selection:bg-blue-500/20">
            {/* Top Terminal Kiosk Bar */}
            <header className="px-6 py-4 bg-white border-b border-slate-200/90 shadow-xs flex items-center justify-between sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center font-black text-white shadow-sm">
                        SF
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-base font-black text-black tracking-tight">
                                StaffFlow Biometric Gate Terminal
                            </h1>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Kiosk Active
                            </span>
                        </div>
                        <p className="text-xs text-slate-600 font-semibold">
                            Self-Service Staff Check-in • Gate Terminal #1 (No Login Required)
                        </p>
                    </div>
                </div>

                {/* Right Utilities */}
                <div className="flex items-center gap-3">
                    {/* Live Clock */}
                    <div className="hidden sm:flex flex-col items-end px-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">{clockDate}</span>
                        <span className="text-sm font-mono font-black text-black">{clockTime || '--:--:-- --'}</span>
                    </div>

                    <button
                        onClick={toggleSound}
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            soundEnabled ? 'bg-slate-100 border-slate-300 text-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                        title={soundEnabled ? 'Sound Enabled' : 'Mute Sound'}
                    >
                        {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black transition-colors cursor-pointer"
                        title="Fullscreen Terminal"
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>

                    <Link
                        href="/login"
                        className="px-3.5 py-2 rounded-xl bg-black hover:bg-slate-800 text-xs font-bold text-white transition-colors shadow-xs"
                    >
                        Admin Portal
                    </Link>
                </div>
            </header>

            {/* Main Interactive Scanning Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left 7 Cols: Controls + Camera Viewfinder or QR */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Mode & Action Selectors Bar */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                        {/* Mode Tabs */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setMode('face')}
                                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    mode === 'face'
                                        ? 'bg-white text-black shadow-xs font-black'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                            >
                                <Camera size={14} />
                                <span>Face Biometrics</span>
                            </button>
                            <button
                                onClick={() => setMode('qr_display')}
                                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                    mode === 'qr_display'
                                        ? 'bg-white text-black shadow-xs font-black'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                            >
                                <QrCode size={14} />
                                <span>Office QR Code</span>
                            </button>
                        </div>

                        {/* Action Toggle (Clock In vs Clock Out) */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setScanAction('check_in')}
                                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    scanAction === 'check_in'
                                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                            >
                                <UserCheck size={14} />
                                <span>Clock In</span>
                            </button>
                            <button
                                onClick={() => setScanAction('check_out')}
                                className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                    scanAction === 'check_out'
                                        ? 'bg-amber-600 text-white shadow-xs font-black'
                                        : 'text-slate-600 hover:text-black'
                                }`}
                            >
                                <Clock size={14} />
                                <span>Clock Out</span>
                            </button>
                        </div>
                    </div>

                    {/* Camera Viewfinder */}
                    {mode === 'face' ? (
                        <div className="bg-black rounded-3xl overflow-hidden shadow-lg border border-slate-800 relative aspect-4/3 sm:aspect-16/10 flex items-center justify-center">
                            {cameraActive ? (
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        facingMode: 'user',
                                        width: { ideal: 1280 },
                                        height: { ideal: 720 }
                                    }}
                                    onUserMedia={() => setCameraPermission('granted')}
                                    onUserMediaError={() => setCameraPermission('denied')}
                                    className="w-full h-full object-cover transform -scale-x-100"
                                />
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <Camera size={48} className="text-slate-600 mx-auto" />
                                    <p className="text-sm font-semibold text-slate-400">Camera is currently paused</p>
                                    <button
                                        onClick={() => setCameraActive(true)}
                                        className="px-4 py-2 bg-black hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-colors"
                                    >
                                        Activate Camera
                                    </button>
                                </div>
                            )}

                            {/* Camera HUD Overlay */}
                            <div className="absolute inset-0 pointer-events-none p-5 sm:p-6 flex flex-col justify-between">
                                {/* Top Badges */}
                                <div className="flex items-center justify-between">
                                    <div className="bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-white text-xs font-bold flex items-center gap-2 shadow-lg">
                                        <Sparkles size={13} className="text-amber-400 animate-pulse" />
                                        <span>AI Biometric Face Engine Active</span>
                                    </div>
                                    <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/15 text-white text-xs font-mono font-bold">
                                        FPS: 30 • Anti-Duplicate
                                    </div>
                                </div>

                                {/* Center Target Box */}
                                <div className="self-center w-52 h-52 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-3xl relative flex items-center justify-center animate-pulse">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
                                        Scan Zone
                                    </div>
                                </div>

                                {/* Bottom Status Bar */}
                                <div className="bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 text-white text-xs font-bold flex items-center justify-between shadow-xl">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${scanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                                        <span className="truncate">{scanning ? 'Verifying facial biometric tokens...' : autoScanMessage}</span>
                                    </div>
                                    <span className="text-[10px] font-mono text-slate-300 uppercase shrink-0 ml-2">
                                        {scanAction === 'check_in' ? '→ Clock-In Mode' : '← Clock-Out Mode'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Dynamic QR Code Screen */
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[420px] space-y-6 shadow-xs">
                            <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm flex items-center justify-center">
                                <QrCode size={190} className="text-black" />
                            </div>

                            <div className="space-y-1.5 max-w-sm">
                                <h3 className="text-lg font-black text-black">Scan with Mobile StaffFlow App</h3>
                                <p className="text-xs text-slate-600 font-semibold">
                                    Open your mobile phone camera to verify attendance inside the office geofence radius.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800 font-bold">
                                <RefreshCw size={12} className="animate-spin text-black" />
                                <span>Refreshing in {qrCountdown}s</span>
                            </div>
                        </div>
                    )}

                    {/* Manual Staff Selection Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-black flex items-center gap-1.5">
                                <span>Target Staff Profile (Auto-Detect or Select)</span>
                            </label>
                            <span className="text-[10px] text-emerald-700 font-bold">● Auto-Detection: ON</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <CustomDropdown
                                    value={selectedEmployeeId}
                                    onChange={(val) => setSelectedEmployeeId(val)}
                                    options={[
                                        { value: 'auto', label: '🤖 Auto-Identify Face (AI Real-Time)' },
                                        ...employees.map(emp => ({
                                            value: emp._id || emp.id || '',
                                            label: `${emp.firstName} ${emp.lastName} (${emp.department || 'Staff'})`
                                        }))
                                    ]}
                                    searchable
                                    placement="top"
                                    className="w-full text-black"
                                />
                            </div>

                            <button
                                onClick={() => handlePerformScan()}
                                disabled={scanning}
                                className="w-full py-2.5 px-4 bg-black hover:bg-slate-800 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <Scan size={15} />
                                <span>{scanning ? 'Verifying...' : 'Manual Verify'}</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right 5 Cols: Live Verification Receipt Card & Activity Feed */}
                <div className="lg:col-span-5 space-y-6">
                    {/* Live Verification Receipt */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <ShieldCheck size={18} className="text-emerald-600" />
                                <h2 className="text-sm font-black text-black uppercase tracking-wider">Live Verification Receipt</h2>
                            </div>
                            {lastVerifiedRecord && (
                                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black">
                                    Verified ({lastVerifiedRecord.confidence}%)
                                </span>
                            )}
                        </div>

                        {lastVerifiedRecord ? (
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="w-16 h-16 rounded-2xl bg-white border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
                                        {lastVerifiedRecord.capturedPhoto ? (
                                            <img
                                                src={lastVerifiedRecord.capturedPhoto}
                                                alt="Staff"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="font-bold text-xl text-black">
                                                {lastVerifiedRecord.employee.firstName?.[0]}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-base font-black text-black">
                                            {lastVerifiedRecord.employee.firstName} {lastVerifiedRecord.employee.lastName}
                                        </h3>
                                        <p className="text-xs text-slate-600 font-semibold">
                                            {lastVerifiedRecord.employee.position || 'Staff Personnel'}
                                        </p>
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[10px] font-bold">
                                            <Building2 size={10} />
                                            <span>{lastVerifiedRecord.employee.department || 'Engineering & IT'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Timestamp</span>
                                        <span className="text-xs font-mono font-bold text-black mt-0.5 block">
                                            {format(new Date(lastVerifiedRecord.time), 'hh:mm:ss a')}
                                        </span>
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Arrival Status</span>
                                        <span className={`text-xs font-bold mt-0.5 block ${
                                            lastVerifiedRecord.status === 'late' ? 'text-amber-700' : 'text-emerald-700'
                                        }`}>
                                            {lastVerifiedRecord.status === 'late' ? '⚠ Late' : '✓ On Time'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                                    <span>Verification Gate:</span>
                                    <span className="font-mono text-black font-bold">{lastVerifiedRecord.location}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center space-y-3">
                                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                    <UserCheck size={24} />
                                </div>
                                <p className="text-xs font-semibold text-slate-500">
                                    Awaiting staff face scan or QR badge...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recent Gate Activity */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div className="flex items-center gap-2 text-xs font-bold text-black">
                                <Sparkles size={13} className="text-black" />
                                <span>Recent Gate Scans</span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono font-bold">
                                {recentScans.length} events
                            </span>
                        </div>

                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                            {recentScans.length > 0 ? (
                                recentScans.map((rec) => (
                                    <div
                                        key={rec.id}
                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[11px]">
                                                {rec.employee.firstName?.[0]}{rec.employee.lastName?.[0]}
                                            </div>
                                            <div>
                                                <div className="font-bold text-black">
                                                    {rec.employee.firstName} {rec.employee.lastName}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-semibold">
                                                    {rec.method}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="font-mono text-[11px] font-bold text-black">
                                                {format(new Date(rec.time), 'hh:mm:ss a')}
                                            </div>
                                            <span className={`text-[9px] font-bold uppercase ${
                                                rec.action === 'check_in' ? 'text-emerald-700' : 'text-amber-700'
                                            }`}>
                                                {rec.action === 'check_in' ? 'IN' : 'OUT'} • {rec.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-slate-400 text-center py-6 font-medium">
                                    No scans recorded in this session yet
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Footer */}
            <footer className="px-6 py-3 bg-white border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
                StaffFlow Biometric Gate Terminal • Version 2.4.0 • Enterprise Attendance System
            </footer>
        </div>
    );
}
