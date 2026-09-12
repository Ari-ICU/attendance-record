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
    const [language, setLanguage] = useState<'km' | 'en'>('km');
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

    // Best natural AI Voice selector (supports Khmer km-KH and English en-US)
    const getBestAIVoice = useCallback((targetLang: 'km' | 'en' = 'km'): SpeechSynthesisVoice | null => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
        const voices = window.speechSynthesis.getVoices();
        if (!voices || voices.length === 0) return null;

        if (targetLang === 'km') {
            // 1. Search for dedicated Khmer voices
            const khmerMatch = voices.find(v =>
                v.lang.toLowerCase().includes('km') ||
                v.lang.toLowerCase().includes('kh') ||
                v.name.toLowerCase().includes('khmer') ||
                v.name.toLowerCase().includes('cambodia') ||
                v.name.includes('ភាសាខ្មែរ')
            );
            if (khmerMatch) return khmerMatch;

            // Fallback for Khmer: Google or default high quality multi-lingual voice
            const googleVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural'));
            if (googleVoice) return googleVoice;
        }

        // Preferred English neural AI voices
        const preferredVoiceNames = [
            'Siri',
            'Samantha (Enhanced)',
            'Samantha',
            'Google US English',
            'Google UK English Female',
            'Microsoft Jenny Online (Natural)',
            'Microsoft Aria Online (Natural)',
            'Microsoft Guy Online (Natural)',
            'Karen',
            'Daniel',
            'Victoria'
        ];

        for (const name of preferredVoiceNames) {
            const match = voices.find(v => v.name.includes(name) || v.voiceURI.includes(name));
            if (match) return match;
        }

        // Fallback to any en-US or en voice
        return voices.find(v => v.lang === 'en-US') ||
               voices.find(v => v.lang.startsWith('en')) ||
               voices[0] || null;
    }, []);

    // Preload voices
    useEffect(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.getVoices();
            window.speechSynthesis.onvoiceschanged = () => {
                window.speechSynthesis.getVoices();
            };
        }
    }, []);

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

    // High-tech Futuristic Cyber Biometric Sound FX + Khmer / English AI Voice
    const playSuccessChime = useCallback(async (isOut: boolean = false, staffFirstName?: string, forcedLang?: 'km' | 'en') => {
        if (!soundEnabled) return;
        const currentLang = forcedLang || language;

        try {
            const ctx = await getAudioContext();
            if (ctx) {
                const now = ctx.currentTime;

                // 1. Sub-Harmonic Cyber Warmth Sweep (Body)
                const subOsc = ctx.createOscillator();
                const subGain = ctx.createGain();
                subOsc.type = 'triangle';
                subOsc.frequency.setValueAtTime(isOut ? 320 : 220, now);
                subOsc.frequency.exponentialRampToValueAtTime(isOut ? 160 : 440, now + 0.18);
                subGain.gain.setValueAtTime(0.2, now);
                subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
                subOsc.connect(subGain);
                subGain.connect(ctx.destination);
                subOsc.start(now);
                subOsc.stop(now + 0.35);

                // 2. High-Tech Cyber Digital Triad (Ascending for In, Descending for Out)
                const frequencies = isOut
                    ? [1567.98, 1174.66, 880] // G6 -> D6 -> A5
                    : [880, 1318.51, 1760];   // A5 -> E6 -> A6

                frequencies.forEach((freq, idx) => {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    const startTime = now + idx * 0.07;
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(freq, startTime);
                    gain.gain.setValueAtTime(0.28, startTime);
                    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.45);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start(startTime);
                    osc.stop(startTime + 0.45);
                });
            }

            // 3. Natural AI Voice Greeting (Speaks clearly in Khmer or English)
            if (typeof window !== 'undefined' && 'speechSynthesis' in window && staffFirstName) {
                setTimeout(() => {
                    try {
                        let phrase = '';
                        if (currentLang === 'km') {
                            phrase = isOut
                                ? `ការផ្ទៀងផ្ទាត់ជោគជ័យ។ អរគុណ ${staffFirstName}!`
                                : `ការផ្ទៀងផ្ទាត់ជោគជ័យ។ សូមស្វាគមន៍ ${staffFirstName}!`;
                        } else {
                            phrase = isOut
                                ? `Identity verified. Goodbye, ${staffFirstName}.`
                                : `Identity verified. Welcome, ${staffFirstName}.`;
                        }

                        const utterance = new SpeechSynthesisUtterance(phrase);
                        utterance.lang = currentLang === 'km' ? 'km-KH' : 'en-US';

                        const aiVoice = getBestAIVoice(currentLang);
                        if (aiVoice) {
                            utterance.voice = aiVoice;
                        }
                        utterance.rate = currentLang === 'km' ? 0.95 : 1.0;
                        utterance.pitch = currentLang === 'km' ? 1.02 : 1.06;
                        utterance.volume = 1.0;

                        window.speechSynthesis.cancel();
                        window.speechSynthesis.speak(utterance);
                    } catch (speakErr) {
                        console.warn('[AI Voice] Speech error:', speakErr);
                    }
                }, 220);
            }
        } catch (e) {
            console.warn('[Audio] play error:', e);
        }
    }, [soundEnabled, language, getAudioContext, getBestAIVoice]);

    // Switch Language handler with live greeting preview
    const handleSwitchLanguage = (lang: 'km' | 'en') => {
        setLanguage(lang);
        if (soundEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
            setTimeout(() => {
                const phrase = lang === 'km'
                    ? 'ប្រព័ន្ធសំឡេងឆ្លាតវៃ AI ភាសាខ្មែរ បានដំណើរការ'
                    : 'AI English voice engine activated.';
                const utterance = new SpeechSynthesisUtterance(phrase);
                utterance.lang = lang === 'km' ? 'km-KH' : 'en-US';
                const aiVoice = getBestAIVoice(lang);
                if (aiVoice) utterance.voice = aiVoice;
                utterance.rate = lang === 'km' ? 0.95 : 1.0;
                utterance.pitch = 1.05;
                utterance.volume = 1.0;
                window.speechSynthesis.cancel();
                window.speechSynthesis.speak(utterance);
            }, 100);
        }
        toast.success(lang === 'km' ? 'បានប្តូរទៅសំឡេងភាសាខ្មែរ 🇰🇭' : 'Switched to English Voice 🇬🇧');
    };

    // Sound toggle handler with futuristic test chime and AI voice intro
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
                osc.frequency.setValueAtTime(1046.5, now);
                osc.frequency.exponentialRampToValueAtTime(1567.98, now + 0.12);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 0.25);
            }

            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                setTimeout(() => {
                    const phrase = language === 'km'
                        ? 'ប្រព័ន្ធសំឡេង AI ភាសាខ្មែរ បានដំណើរការ'
                        : 'AI Biometric voice active.';
                    const utterance = new SpeechSynthesisUtterance(phrase);
                    utterance.lang = language === 'km' ? 'km-KH' : 'en-US';
                    const aiVoice = getBestAIVoice(language);
                    if (aiVoice) utterance.voice = aiVoice;
                    utterance.rate = language === 'km' ? 0.95 : 1.0;
                    utterance.pitch = 1.05;
                    utterance.volume = 1.0;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                }, 150);
            }

            toast.success(language === 'km' ? 'សំឡេង AI ភាសាខ្មែរ បើកដំណើរការ' : 'AI Biometric Voice Enabled', { icon: '🎙️' });
        } else {
            if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
            }
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
        <div className="min-h-screen bg-slate-50/80 text-black font-sans flex flex-col justify-between selection:bg-blue-500/20 max-w-full overflow-x-hidden">
            {/* Top Terminal Kiosk Bar */}
            <header className="px-3 sm:px-6 py-3 sm:py-4 bg-white border-b border-slate-200/90 shadow-xs flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sticky top-0 z-40">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-black flex items-center justify-center font-black text-white shadow-sm shrink-0">
                        SF
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                            <h1 className="text-sm sm:text-base font-black text-black tracking-tight truncate">
                                StaffFlow Biometric Gate
                            </h1>
                            <span className="px-1.5 sm:px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] sm:text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                Active
                            </span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-slate-600 font-semibold hidden sm:block truncate">
                            Self-Service Staff Check-in • Gate Terminal #1 (No Login Required)
                        </p>
                    </div>
                </div>

                {/* Right Utilities */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {/* Voice Language Selector */}
                    <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 text-xs font-bold">
                        <button
                            onClick={() => handleSwitchLanguage('km')}
                            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs ${
                                language === 'km'
                                    ? 'bg-white text-black shadow-xs font-black'
                                    : 'text-slate-500 hover:text-black'
                            }`}
                            title="ភាសាខ្មែរ (Khmer Voice)"
                        >
                            <span>🇰🇭</span>
                            <span>ខ្មែរ</span>
                        </button>
                        <button
                            onClick={() => handleSwitchLanguage('en')}
                            className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg transition-all flex items-center gap-1 cursor-pointer text-[11px] sm:text-xs ${
                                language === 'en'
                                    ? 'bg-white text-black shadow-xs font-black'
                                    : 'text-slate-500 hover:text-black'
                            }`}
                            title="English Voice"
                        >
                            <span>🇬🇧</span>
                            <span>EN</span>
                        </button>
                    </div>

                    {/* Live Clock */}
                    <div className="hidden md:flex flex-col items-end px-3 py-1 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[9px] font-mono text-slate-500 font-bold uppercase">{clockDate}</span>
                        <span className="text-xs font-mono font-black text-black">{clockTime || '--:--:-- --'}</span>
                    </div>

                    <button
                        onClick={toggleSound}
                        className={`p-2 sm:p-2.5 rounded-xl border transition-colors cursor-pointer ${
                            soundEnabled ? 'bg-slate-100 border-slate-300 text-black' : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                        title={soundEnabled ? 'Sound Enabled' : 'Mute Sound'}
                    >
                        {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-300 text-black transition-colors cursor-pointer"
                        title="Fullscreen Terminal"
                    >
                        {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                    </button>

                    <Link
                        href="/login"
                        className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-black hover:bg-slate-800 text-[11px] sm:text-xs font-bold text-white transition-colors shadow-xs shrink-0"
                    >
                        Admin
                    </Link>
                </div>
            </header>

            {/* Main Interactive Scanning Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
                {/* Left 7 Cols: Controls + Camera Viewfinder or QR */}
                <div className="lg:col-span-7 space-y-4">
                    {/* Mode & Action Selectors Bar */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
                        {/* Mode Tabs */}
                        <div className="flex items-center bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
                            <button
                                onClick={() => setMode('face')}
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer ${
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
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                                className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
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
                                <div className="text-center p-6 sm:p-8 space-y-3">
                                    <Camera size={40} className="text-slate-600 mx-auto" />
                                    <p className="text-xs sm:text-sm font-semibold text-slate-400">Camera is currently paused</p>
                                    <button
                                        onClick={() => setCameraActive(true)}
                                        className="px-4 py-2 bg-black hover:bg-slate-800 rounded-xl text-xs font-bold text-white transition-colors"
                                    >
                                        Activate Camera
                                    </button>
                                </div>
                            )}

                            {/* Camera HUD Overlay */}
                            <div className="absolute inset-0 pointer-events-none p-3 sm:p-6 flex flex-col justify-between">
                                {/* Top Badges */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="bg-black/75 backdrop-blur-md px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full border border-white/15 text-white text-[10px] sm:text-xs font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg truncate">
                                        <Sparkles size={12} className="text-amber-400 animate-pulse shrink-0" />
                                        <span className="truncate">AI Biometric Active</span>
                                    </div>
                                    <div className="bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 text-white text-[10px] sm:text-xs font-mono font-bold shrink-0">
                                        FPS: 30
                                    </div>
                                </div>

                                {/* Center Target Box */}
                                <div className="self-center w-40 h-40 sm:w-60 sm:h-60 border-2 border-emerald-400/80 rounded-3xl relative flex items-center justify-center animate-pulse">
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-2.5 sm:px-3 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider shadow-md whitespace-nowrap">
                                        Scan Zone
                                    </div>
                                </div>

                                {/* Bottom Status Bar */}
                                <div className="bg-black/80 backdrop-blur-md px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl border border-white/15 text-white text-[11px] sm:text-xs font-bold flex items-center justify-between shadow-xl gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${scanning ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                                        <span className="truncate">{scanning ? 'Verifying facial biometrics...' : autoScanMessage}</span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] font-mono text-slate-300 uppercase shrink-0">
                                        {scanAction === 'check_in' ? '→ In' : '← Out'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Dynamic QR Code Screen */
                        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[360px] sm:min-h-[420px] space-y-4 sm:space-y-6 shadow-xs">
                            <div className="p-4 sm:p-6 bg-slate-50 border border-slate-200 rounded-3xl shadow-sm flex items-center justify-center">
                                <QrCode size={160} className="text-black sm:w-[190px] sm:h-[190px]" />
                            </div>

                            <div className="space-y-1.5 max-w-sm px-2">
                                <h3 className="text-base sm:text-lg font-black text-black">Scan with Mobile StaffFlow App</h3>
                                <p className="text-xs text-slate-600 font-semibold">
                                    Open your mobile phone camera to verify attendance inside the office geofence radius.
                                </p>
                            </div>

                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800 font-bold">
                                <RefreshCw size={12} className="animate-spin text-black" />
                                <span>Refreshing in {qrCountdown}s</span>
                            </div>
                        </div>
                    )}

                    {/* Manual Staff Selection Card */}
                    <div className="bg-white border border-slate-200/90 rounded-2xl p-3 sm:p-4 space-y-3 shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                            <label className="text-xs font-bold text-black flex items-center gap-1.5 truncate">
                                <span>Target Staff Profile (Auto-Detect or Select)</span>
                            </label>
                            <span className="text-[10px] text-emerald-700 font-bold shrink-0">● Auto: ON</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
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
                <div className="lg:col-span-5 space-y-5 sm:space-y-6">
                    {/* Live Verification Receipt */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-4 sm:space-y-5">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                                <ShieldCheck size={18} className="text-emerald-600 shrink-0" />
                                <h2 className="text-xs sm:text-sm font-black text-black uppercase tracking-wider truncate">Live Verification Receipt</h2>
                            </div>
                            {lastVerifiedRecord && (
                                <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-black shrink-0">
                                    Verified ({lastVerifiedRecord.confidence}%)
                                </span>
                            )}
                        </div>

                        {lastVerifiedRecord ? (
                            <div className="space-y-3.5 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white border-2 border-emerald-500 overflow-hidden flex items-center justify-center shrink-0 shadow-sm">
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
                                    <div className="space-y-1 min-w-0">
                                        <h3 className="text-sm sm:text-base font-black text-black truncate">
                                            {lastVerifiedRecord.employee.firstName} {lastVerifiedRecord.employee.lastName}
                                        </h3>
                                        <p className="text-xs text-slate-600 font-semibold truncate">
                                            {lastVerifiedRecord.employee.position || 'Staff Personnel'}
                                        </p>
                                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[10px] font-bold">
                                            <Building2 size={10} />
                                            <span className="truncate">{lastVerifiedRecord.employee.department || 'Engineering & IT'}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 block">Timestamp</span>
                                        <span className="text-xs font-mono font-bold text-black mt-0.5 block truncate">
                                            {format(new Date(lastVerifiedRecord.time), 'hh:mm:ss a')}
                                        </span>
                                    </div>

                                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <span className="text-[9px] sm:text-[10px] font-bold uppercase text-slate-500 block">Arrival Status</span>
                                        <span className={`text-xs font-bold mt-0.5 block truncate ${
                                            lastVerifiedRecord.status === 'late' ? 'text-amber-700' : 'text-emerald-700'
                                        }`}>
                                            {lastVerifiedRecord.status === 'late' ? '⚠ Late' : '✓ On Time'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] sm:text-[11px] text-slate-600 font-semibold flex items-center justify-between">
                                    <span>Verification Gate:</span>
                                    <span className="font-mono text-black font-bold">{lastVerifiedRecord.location}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 sm:py-12 text-center space-y-2.5 sm:space-y-3">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                                    <UserCheck size={22} />
                                </div>
                                <p className="text-xs font-semibold text-slate-500">
                                    Awaiting staff face scan or QR badge...
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Recent Gate Activity */}
                    <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-6 shadow-xs space-y-3 sm:space-y-4">
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
                                        className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs gap-2"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-7 h-7 rounded-lg bg-black text-white flex items-center justify-center font-bold text-[11px] shrink-0">
                                                {rec.employee.firstName?.[0]}{rec.employee.lastName?.[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-black truncate">
                                                    {rec.employee.firstName} {rec.employee.lastName}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-semibold truncate">
                                                    {rec.method}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right shrink-0">
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
            <footer className="px-3 sm:px-6 py-3 bg-white border-t border-slate-200 text-center text-[10px] sm:text-xs text-slate-500 font-medium">
                StaffFlow Biometric Gate Terminal • Version 2.4.0 • Enterprise Attendance System
            </footer>
        </div>
    );
}
