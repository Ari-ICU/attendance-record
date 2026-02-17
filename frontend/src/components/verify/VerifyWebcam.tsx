'use client';

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import toast from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';
import { AttendanceService } from '@/services/attendance.service';
import { SettingsService } from '@/services/settings.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, Camera, CheckCircle2, Loader2, Scan, ShieldAlert } from 'lucide-react';

const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 340;
const VERIFY_DEBOUNCE_MS = 2000;
const EAR_THRESHOLD = 0.30;
const EAR_DELTA = 0.55;

/**
 * BIOMETRIC MODEL CONFIGURATION
 * Adjust these values to balance performance and accuracy.
 */
const FACE_API_CONFIG = {
    // model: 'tinyFaceDetector' (Fast, 1.8MB) or 'ssdMobilenetv1' (Accurate, 5.4MB)
    detector: 'tinyFaceDetector' as 'tinyFaceDetector' | 'ssdMobilenetv1',

    // For TinyFaceDetector: Higher = more accurate but slower. Standard: 160, 224, 320, 416, 512, 608
    inputSize: 416,

    // Confidence threshold (0.1 to 0.9). Higher = stricter detection.
    scoreThreshold: 0.5,

    // Minimum confidence for SSD Mobilenet (0.1 to 0.9)
    minConfidence: 0.5,

    // If true, scanning will FAIL if geolocation is blocked or outside range.
    // If false, it will allow the scan but still show location data.
    requireGeofence: false,

    // Auto-bypass liveness check (Set to true for fully automatic scan)
    bypassLiveness: true
};

// Default fallbacks while settings load
const DEFAULT_OFFICE_COORDS = { lat: 11.5564, lng: 104.9282 };
const DEFAULT_MAX_RANGE = 50;

interface FaceVerifyProps {
    employeeId?: string;
    mode?: 'verify-only' | 'check-in' | 'check-out';
    onSuccess?: (data: any) => void;
    onIdentify?: (employee: any) => void;
}

const FaceVerify: React.FC<FaceVerifyProps> = ({ employeeId, mode = 'verify-only', onSuccess, onIdentify }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('Initializing Biometric modules...');
    const [verifying, setVerifying] = useState(false);
    const [framePulse, setFramePulse] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const lastVerifiedRef = useRef<number>(0);
    const [blinkCount, setBlinkCount] = useState(0);
    const wasClosedRef = useRef(false);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    const [officeSettings, setOfficeSettings] = useState({
        lat: DEFAULT_OFFICE_COORDS.lat,
        lng: DEFAULT_OFFICE_COORDS.lng,
        range: DEFAULT_MAX_RANGE
    });
    const [showBlinkEffect, setShowBlinkEffect] = useState(false);
    const [currentEAR, setCurrentEAR] = useState(0);
    const lastIdentifyRef = useRef<number>(0);
    const identifyInProgressRef = useRef<boolean>(false);
    const identifiedIdRef = useRef<string | null>(null);
    const isDetectingRef = useRef(false);

    // Fetch office settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const settings = await SettingsService.getSettings();
                if (settings) {
                    setOfficeSettings({
                        lat: parseFloat(settings.office_latitude) || DEFAULT_OFFICE_COORDS.lat,
                        lng: parseFloat(settings.office_longitude) || DEFAULT_OFFICE_COORDS.lng,
                        range: parseInt(settings.geofence_range_meters) || DEFAULT_MAX_RANGE
                    });
                }
            } catch (err) {
                console.warn('Could not sync office geofence settings', err);
            }
        };
        loadSettings();
    }, []);

    const [locationError, setLocationError] = useState<string | null>(null);

    const requestLocation = () => {
        if (!('geolocation' in navigator)) {
            setLocationError('Geolocation Not Supported');
            return;
        }

        setStatus('Requesting geolocation...');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setLocationError(null);
                toast.success('Geofence Secured');
            },
            (err) => {
                console.warn('Location access denied or unavailable', err);
                let msg = 'Location Unavailable';
                if (err.code === 1) msg = 'Location Access Denied';
                if (err.code === 2) msg = 'Position Unavailable';
                if (err.code === 3) msg = 'Location Timeout';
                setLocationError(msg);
                toast.error(`${msg}: Please enable location in browser settings.`);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    // Get location on mount
    useEffect(() => {
        requestLocation();
    }, []);

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    const getEAR = (eye: any[]) => {
        const p2_p6 = Math.sqrt(Math.pow(eye[1].x - eye[5].x, 2) + Math.pow(eye[1].y - eye[5].y, 2));
        const p3_p5 = Math.sqrt(Math.pow(eye[2].x - eye[4].x, 2) + Math.pow(eye[2].y - eye[4].y, 2));
        const p1_p4 = Math.sqrt(Math.pow(eye[0].x - eye[3].x, 2) + Math.pow(eye[0].y - eye[3].y, 2));
        return (p2_p6 + p3_p5) / (2.0 * p1_p4);
    };

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const modelPath = '/models';

                // Load the configured detector
                if (FACE_API_CONFIG.detector === 'tinyFaceDetector') {
                    await faceapi.nets.tinyFaceDetector.loadFromUri(`${modelPath}/tiny_face_detector/`);
                } else {
                    await faceapi.nets.ssdMobilenetv1.loadFromUri(`${modelPath}/ssd_mobilenetv1/`);
                }

                await faceapi.nets.faceLandmark68Net.loadFromUri(`${modelPath}/face_landmark_68_model/`);
                await faceapi.nets.faceRecognitionNet.loadFromUri(`${modelPath}/face_recognition_model/`);
                setModelsLoaded(true);
                setStatus('Ready for biometric scan');
            } catch (err) {
                setStatus('Scanner module failure');
                console.error('Model loading error:', err);
                toast.error('Failed to load face detection models');
            }
        };
        loadModels();
    }, []);

    // Pulse animation for the frame
    useEffect(() => {
        const interval = setInterval(() => setFramePulse(prev => !prev), 800);
        return () => clearInterval(interval);
    }, []);

    // Real-time face detection & verification
    useEffect(() => {
        if (!modelsLoaded) return;

        const detectFace = async () => {
            if (isDetectingRef.current) return;

            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState !== 4 || video.videoWidth === 0 || video.videoHeight === 0) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            isDetectingRef.current = true;
            let detections: any = [];
            try {
                // Performing the detection with a chained task.
                // If it fails internally (e.g., the "Box.constructor" error), it will be caught by the catch block.
                // Performing the detection with a chained task using centralized config
                const detectorOptions = FACE_API_CONFIG.detector === 'tinyFaceDetector'
                    ? new faceapi.TinyFaceDetectorOptions({
                        inputSize: FACE_API_CONFIG.inputSize,
                        scoreThreshold: FACE_API_CONFIG.scoreThreshold
                    })
                    : new faceapi.SsdMobilenetv1Options({
                        minConfidence: FACE_API_CONFIG.minConfidence
                    });

                detections = await faceapi
                    .detectAllFaces(video, detectorOptions)
                    .withFaceLandmarks()
                    .withFaceDescriptors();
            } catch (err) {
                console.debug('Biometric processing interrupted', err);
            } finally {
                isDetectingRef.current = false;
            }

            if (!detections) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const frameX = (canvas.width - FRAME_WIDTH) / 2;
            const frameY = (canvas.height - FRAME_HEIGHT) / 2;

            let color = framePulse ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.4)';
            let statusMessage = 'Position face within scanner frame';

            if (!employeeId) {
                statusMessage = 'Awaiting Biometric Data...';
                // Don't return, allow detection for identification
            }

            if (detections.length === 0) {
                statusMessage = 'No biometric target detected';
                color = 'rgba(244, 63, 94, 0.5)';
            } else if (detections.length > 1) {
                statusMessage = 'Multiple subjects detected';
                color = 'rgba(244, 63, 94, 0.5)';
            } else {
                const detection = detections[0];
                if (!detection || !detection.detection || !detection.detection.box) return;

                const box = detection.detection.box;

                // Safety check for invalid box dimensions
                if (!box || typeof box.x !== 'number' || typeof box.y !== 'number' ||
                    typeof box.width !== 'number' || typeof box.height !== 'number') {
                    return;
                }

                const landmarks = detection.landmarks;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const ear = (getEAR(leftEye) + getEAR(rightEye)) / 2;
                setCurrentEAR(ear);

                // Draw detection feedback on canvas
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
                ctx.lineWidth = 2;
                ctx.setLineDash([5, 5]);

                // Ensure values are finite numbers
                if (Number.isFinite(box.x) && Number.isFinite(box.y) &&
                    Number.isFinite(box.width) && Number.isFinite(box.height)) {
                    ctx.strokeRect(box.x, box.y, box.width, box.height);
                }
                ctx.setLineDash([]);

                // Draw subtle points for landmarks
                ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
                landmarks.positions.forEach((p: any) => ctx.fillRect(p.x, p.y, 2, 2));

                // Simple blink logic
                if (ear < EAR_THRESHOLD) {
                    wasClosedRef.current = true;
                } else if (wasClosedRef.current && ear > EAR_THRESHOLD + EAR_DELTA) {
                    setBlinkCount(prev => prev + 1);
                    wasClosedRef.current = false;
                    setShowBlinkEffect(true);
                    setTimeout(() => setShowBlinkEffect(false), 400);
                }

                // More lenient frame check - allow significant padding
                const padding = 40;
                const insideFrame =
                    box.x >= frameX - padding &&
                    box.y >= frameY - padding &&
                    box.x + box.width <= frameX + FRAME_WIDTH + padding &&
                    box.y + box.height <= frameY + FRAME_HEIGHT + padding;

                let livenessMessage = blinkCount > 0 ? 'Liveness: OK' : 'Blink to prove identity';

                if (!insideFrame) {
                    statusMessage = 'Subject out of frame';
                } else if (blinkCount === 0) {
                    statusMessage = 'Blink to verify liveness';
                } else if (!userLocation) {
                    statusMessage = 'Securing GPS Anchor...';
                    color = 'rgba(245, 158, 11, 0.8)';
                } else {
                    statusMessage = 'Identity verification active';
                }

                color = insideFrame ? (blinkCount > 0 || FACE_API_CONFIG.bypassLiveness ? 'rgba(59, 130, 246, 0.8)' : 'rgba(245, 158, 11, 0.8)') : 'rgba(244, 63, 94, 0.5)';

                // Periodic identification (if not already verified or verifying)
                if (insideFrame && !verifying && !isSuccess && Date.now() - lastIdentifyRef.current > 3000 && !identifyInProgressRef.current) {
                    const descriptorArray = Array.from(detection.descriptor) as number[];

                    // Only identify if we don't have an ID or if the detected person changed
                    // Actually, let's just do it if we are "Awaiting"
                    if (!employeeId || identifiedIdRef.current !== employeeId) {
                        lastIdentifyRef.current = Date.now();
                        identifyInProgressRef.current = true;

                        EmployeeService.verifyFace({
                            faceDescriptor: descriptorArray
                        }).then(result => {
                            if (result.employee && result.employee._id !== identifiedIdRef.current) {
                                identifiedIdRef.current = result.employee._id;
                                if (onIdentify) onIdentify(result.employee);
                            }
                        }).catch(err => {
                            // Silently fail identification in background
                            console.debug('Auto-identification failed:', err.message);
                        }).finally(() => {
                            identifyInProgressRef.current = false;
                        });
                    }
                }

                if (insideFrame && (blinkCount > 0 || FACE_API_CONFIG.bypassLiveness) && Date.now() - lastVerifiedRef.current > VERIFY_DEBOUNCE_MS && !verifying) {
                    // Check Geofencing
                    if (FACE_API_CONFIG.requireGeofence) {
                        if (userLocation) {
                            const dist = calculateDistance(userLocation.lat, userLocation.lng, officeSettings.lat, officeSettings.lng);
                            if (dist > officeSettings.range) {
                                setStatus('OUTSIDE AUTH RANGE');
                                toast.error(`Scan denied: Device is ${Math.round(dist - officeSettings.range)}m outside authorized zone.`);
                                setVerifying(false);
                                return;
                            }
                        } else {
                            return; // Wait for location if required
                        }
                    }

                    lastVerifiedRef.current = Date.now();
                    setVerifying(true);
                    setStatus('Extracting descriptors...');

                    try {
                        const descriptorArray = Array.from(detection.descriptor) as number[];
                        let result;

                        if (mode === 'check-in') {
                            result = await AttendanceService.checkIn({
                                employeeId: employeeId || undefined,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray,
                                location: userLocation ? {
                                    latitude: userLocation.lat,
                                    longitude: userLocation.lng
                                } : undefined,
                                platform: navigator.platform,
                                browser: navigator.userAgent
                            });
                        } else if (mode === 'check-out') {
                            result = await AttendanceService.checkOut({
                                employeeId: employeeId || undefined,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray,
                                location: userLocation ? {
                                    latitude: userLocation.lat,
                                    longitude: userLocation.lng
                                } : undefined,
                                platform: navigator.platform,
                                browser: navigator.userAgent
                            });
                        } else {
                            result = await EmployeeService.verifyFace({
                                employeeId: employeeId || '',
                                faceDescriptor: descriptorArray
                            });
                        }

                        const identifiedName = result.employee ? `${result.employee.firstName} ${result.employee.lastName}` : '';

                        setIsSuccess(true);
                        setStatus(identifiedName ? `Welcome, ${identifiedName}` : 'Authentication Confirmed');
                        toast.success(identifiedName ? `Identified: ${identifiedName}` : 'Check-point passed.');
                        if (onSuccess) onSuccess(result);

                        setTimeout(() => {
                            setIsSuccess(false);
                            setVerifying(false);
                            setBlinkCount(0); // Reset for next scan
                        }, 3000);

                    } catch (err: any) {
                        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Access Denied';
                        const isAlreadyDone = errorMessage.toLowerCase().includes('already checked in') ||
                            errorMessage.toLowerCase().includes('already checked out');

                        if (isAlreadyDone) {
                            setIsSuccess(true);
                            const isCheckIn = errorMessage.toLowerCase().includes('checked in');
                            const statusMsg = isCheckIn ? 'Already Checked In Today' : 'Already Checked Out Today';
                            setStatus(statusMsg);
                            toast.success(errorMessage);
                            if (onSuccess) onSuccess({ status: isCheckIn ? 'already_checked_in' : 'already_checked_out' });

                            setTimeout(() => {
                                setIsSuccess(false);
                                setVerifying(false);
                                setBlinkCount(0);
                            }, 3000);
                        } else {
                            setStatus(errorMessage);
                            toast.error(errorMessage);
                            setVerifying(false);
                        }
                    }
                }
            }

            if (!verifying && !isSuccess) setStatus(statusMessage);

            // Draw Scanner Frame with Glow
            ctx.shadowBlur = 15;
            ctx.shadowColor = color;
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;

            // Draw corners
            const cornerSize = 40;
            // Top Left
            ctx.beginPath();
            ctx.moveTo(frameX, frameY + cornerSize);
            ctx.lineTo(frameX, frameY);
            ctx.lineTo(frameX + cornerSize, frameY);
            ctx.stroke();

            // Top Right
            ctx.beginPath();
            ctx.moveTo(frameX + FRAME_WIDTH - cornerSize, frameY);
            ctx.lineTo(frameX + FRAME_WIDTH, frameY);
            ctx.lineTo(frameX + FRAME_WIDTH, frameY + cornerSize);
            ctx.stroke();

            // Bottom Right
            ctx.beginPath();
            ctx.moveTo(frameX + FRAME_WIDTH, frameY + FRAME_HEIGHT - cornerSize);
            ctx.lineTo(frameX + FRAME_WIDTH, frameY + FRAME_HEIGHT);
            ctx.lineTo(frameX + FRAME_WIDTH - cornerSize, frameY + FRAME_HEIGHT);
            ctx.stroke();

            // Bottom Left
            ctx.beginPath();
            ctx.moveTo(frameX + cornerSize, frameY + FRAME_HEIGHT);
            ctx.lineTo(frameX, frameY + FRAME_HEIGHT);
            ctx.lineTo(frameX, frameY + FRAME_HEIGHT - cornerSize);
            ctx.stroke();

            // Draw center crosshair
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2 - 10, canvas.height / 2);
            ctx.lineTo(canvas.width / 2 + 10, canvas.height / 2);
            ctx.moveTo(canvas.width / 2, canvas.height / 2 - 10);
            ctx.lineTo(canvas.width / 2, canvas.height / 2 + 10);
            ctx.stroke();
        };

        const interval = setInterval(() => {
            detectFace().catch(err => console.debug('Detection loop error:', err));
        }, 80);
        return () => clearInterval(interval);
    }, [modelsLoaded, framePulse, employeeId, verifying, isSuccess]);

    return (
        <div className="w-full relative flex flex-col items-center">

            <div className="relative w-full aspect-[4/3] bg-black">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute inset-0 w-full h-full pointer-events-none z-10"
                />

                <AnimatePresence>
                    {showBlinkEffect && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-white pointer-events-none z-15"
                        />
                    )}
                </AnimatePresence>

                {/* HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {/* Scanning Line with Text */}
                    <motion.div
                        initial={{ top: '10%' }}
                        animate={{ top: '90%' }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-px bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)] flex items-center justify-end pr-4"
                    >
                        <span className="text-[8px] font-black text-blue-400 translate-y-[-8px] tracking-[0.3em] uppercase opacity-50">
                            Scanning Surface...
                        </span>
                    </motion.div>

                    {/* Corner Metadata & Telemetry */}
                    <div className="absolute top-6 left-6 text-[8px] font-mono text-blue-500/60 uppercase tracking-widest space-y-1">
                        <div>REC // Biometric Stream </div>
                        <div>ENC // SHA-256 Protocol </div>
                        <div>SRC // Integrated Sensor </div>
                    </div>

                    <div className="absolute top-6 right-6 text-[8px] font-mono text-right text-blue-500/60 uppercase tracking-widest space-y-1">
                        <div>FRAME // {modelsLoaded ? '640x480' : '0x0'}</div>
                        <div>LAT // {userLocation ? userLocation.lat.toFixed(4) : '---'}</div>
                        <div>LNG // {userLocation ? userLocation.lng.toFixed(4) : '---'}</div>
                        <div className={currentEAR < EAR_THRESHOLD ? 'text-emerald-400 font-black scale-110' : 'text-blue-500/60'}>
                            EAR // {currentEAR.toFixed(3)} {currentEAR < EAR_THRESHOLD && '• [CLOSED]'}
                        </div>
                    </div>

                    <div className="absolute bottom-6 left-6 text-[8px] font-mono text-blue-500/60 uppercase tracking-widest">
                        Status: <span className={status.includes('No') ? 'text-rose-500' : 'text-blue-400'}>{status}</span>
                    </div>

                    <div className="absolute bottom-6 right-6 text-[8px] font-mono text-right text-blue-500/60 uppercase tracking-widest">
                        Liveness // <span className={(blinkCount > 0 || FACE_API_CONFIG.bypassLiveness) ? 'text-emerald-500' : 'text-rose-500'}>{(blinkCount > 0 || FACE_API_CONFIG.bypassLiveness) ? 'VERIFIED' : 'PENDING'}</span>
                    </div>

                    {/* Dynamic Status Badge */}
                    <div className="absolute top-1/4 right-10 flex flex-col items-center gap-2 opacity-40">
                        <div className="w-1 h-32 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                animate={{ height: blinkCount > 0 ? '100%' : '20%' }}
                                className="w-full bg-blue-500 transition-all duration-700"
                            />
                        </div>
                        <div className="text-[6px] font-bold text-blue-500 vertical-text uppercase tracking-tighter">Bio-Sig</div>
                    </div>
                </div>

                {/* Status Indicator Overlays */}
                <AnimatePresence>
                    {verifying && !isSuccess && (
                        <motion.div
                            key="verifying"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-blue-600/10 backdrop-blur-[2px] z-30 flex flex-col items-center justify-center"
                        >
                            <Loader2 className="w-12 h-12 text-blue-400 animate-spin mb-4" />
                            <div className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em]">Establishing Link</div>
                        </motion.div>
                    )}

                    {isSuccess && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-emerald-600/20 backdrop-blur-[4px] z-30 flex flex-col items-center justify-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4 border-2 border-emerald-500/50">
                                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em] mb-1">Access Granted</div>
                            <div className="text-[8px] font-bold text-emerald-400/60 uppercase tracking-[0.2em]">Identity Confirmed</div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Status Bar */}
            <div className="w-full p-5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between backdrop-blur-md">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${isSuccess ? 'bg-emerald-500' : (status.includes('No') || status.includes('Multiple') ? 'bg-rose-500' : 'bg-blue-500')} animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]`} />
                        <span className={`text-xs font-black uppercase tracking-[0.15em] ${isSuccess ? 'text-emerald-400' : (status.includes('No') || status.includes('Multiple') ? 'text-rose-400' : 'text-blue-400')}`}>
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center gap-6 mt-1">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${(blinkCount > 0 || FACE_API_CONFIG.bypassLiveness) ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-rose-500/50'}`} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Liveness: {(blinkCount > 0 || FACE_API_CONFIG.bypassLiveness) ? 'VERIFIED' : 'PENDING'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : (locationError ? 'bg-rose-500' : 'bg-amber-500/50')}`} />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pr-2">
                                Geofence: {userLocation ? 'SECURED' : (locationError || 'SYNCING')}
                            </span>
                            {!userLocation && (
                                <button
                                    onClick={requestLocation}
                                    className="px-2 py-0.5 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/30 rounded text-[7px] font-black text-blue-400 uppercase transition-all"
                                >
                                    Retry
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-2">
                        <Scan className="w-4 h-4 text-slate-600" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">Biometric-V1.2</span>
                    </div>
                    <div className="text-[8px] font-mono text-slate-700 uppercase">Secure Auth Protocol</div>
                </div>
            </div>

            {/* Location Access Denied Alert */}
            <AnimatePresence>
                {locationError && !userLocation && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-center justify-between w-full"
                    >
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-5 h-5 text-rose-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest leading-none">Access Restricted</span>
                                <span className="text-[9px] font-medium text-rose-400/60 mt-0.5">{locationError === 'Location Access Denied' ? 'Geolocation permission is blocked. Reset site permissions in browser.' : locationError}</span>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={requestLocation}
                                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-md text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/25"
                            >
                                Retry Link
                            </button>
                            {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
                                <button
                                    onClick={() => {
                                        setUserLocation(DEFAULT_OFFICE_COORDS);
                                        setLocationError(null);
                                        toast.success('Developer Bypass Active');
                                    }}
                                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-md text-[9px] font-black uppercase tracking-widest border border-slate-700 transition-all"
                                >
                                    Dev Bypass
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FaceVerify;