'use client';

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import toast, { Toaster } from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';
import { AttendanceService } from '@/services/attendance.service';
import { SettingsService } from '@/services/settings.service';
import { motion, AnimatePresence } from 'framer-motion';
import { Aperture, Camera, CheckCircle2, Loader2, Scan, ShieldAlert } from 'lucide-react';

const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 340;
const VERIFY_DEBOUNCE_MS = 2000;
const EAR_THRESHOLD = 0.22; // Threshold for eye blink detection

// Default fallbacks while settings load
const DEFAULT_OFFICE_COORDS = { lat: 11.5564, lng: 104.9282 };
const DEFAULT_MAX_RANGE = 50;

interface FaceVerifyProps {
    employeeId: string;
    mode?: 'verify-only' | 'check-in' | 'check-out';
    onSuccess?: (data: any) => void;
}

const FaceVerify: React.FC<FaceVerifyProps> = ({ employeeId, mode = 'verify-only', onSuccess }) => {
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

    // Get location on mount

    // Get location on mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                (err) => console.warn('Location access denied or unavailable', err),
                { enableHighAccuracy: true }
            );
        }
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
                await faceapi.nets.tinyFaceDetector.loadFromUri(`${modelPath}/tiny_face_detector/`);
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
            const video = webcamRef.current?.video;
            const canvas = canvasRef.current;
            if (!video || !canvas || video.readyState !== 4) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const detections = await faceapi
                .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512 }))
                .withFaceLandmarks()
                .withFaceDescriptors();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const frameX = (canvas.width - FRAME_WIDTH) / 2;
            const frameY = (canvas.height - FRAME_HEIGHT) / 2;

            let color = framePulse ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.4)';
            let statusMessage = 'Position face within scanner frame';

            if (!employeeId) {
                statusMessage = 'Awaiting Authorization ID';
                setStatus(statusMessage);
                return;
            }

            if (detections.length === 0) {
                statusMessage = 'No biometric target detected';
                color = 'rgba(244, 63, 94, 0.5)';
            } else if (detections.length > 1) {
                statusMessage = 'Multiple subjects detected';
                color = 'rgba(244, 63, 94, 0.5)';
            } else {
                const box = detections[0].detection.box;
                const landmarks = detections[0].landmarks;
                const leftEye = landmarks.getLeftEye();
                const rightEye = landmarks.getRightEye();
                const ear = (getEAR(leftEye) + getEAR(rightEye)) / 2;

                // Simple blink logic
                if (ear < EAR_THRESHOLD) {
                    wasClosedRef.current = true;
                } else if (wasClosedRef.current && ear > EAR_THRESHOLD + 0.05) {
                    setBlinkCount(prev => prev + 1);
                    wasClosedRef.current = false;
                }

                const insideFrame =
                    box.x >= frameX &&
                    box.y >= frameY &&
                    box.x + box.width <= frameX + FRAME_WIDTH &&
                    box.y + box.height <= frameY + FRAME_HEIGHT;

                let livenessMessage = blinkCount > 0 ? 'Liveness: OK' : 'Blink to prove identity';
                statusMessage = insideFrame ? `${livenessMessage} - Link Establishing...` : 'Recenter for optimal scan';
                color = insideFrame ? (blinkCount > 0 ? 'rgba(59, 130, 246, 0.8)' : 'rgba(245, 158, 11, 0.8)') : 'rgba(245, 158, 11, 0.4)';

                if (insideFrame && blinkCount > 0 && Date.now() - lastVerifiedRef.current > VERIFY_DEBOUNCE_MS && !verifying) {
                    // Check Geofencing
                    if (userLocation) {
                        const dist = calculateDistance(userLocation.lat, userLocation.lng, officeSettings.lat, officeSettings.lng);
                        if (dist > officeSettings.range) {
                            setStatus('OUTSIDE AUTH RANGE');
                            toast.error(`Scan denied: Device is ${Math.round(dist - officeSettings.range)}m outside authorized zone.`);
                            return;
                        }
                    } else {
                        setStatus('Awaiting Secure Geofence...');
                        return;
                    }

                    lastVerifiedRef.current = Date.now();
                    setVerifying(true);
                    setStatus('Extracting descriptors...');

                    try {
                        const descriptorArray = Array.from(detections[0].descriptor);
                        let result;

                        if (mode === 'check-in') {
                            result = await AttendanceService.checkIn({
                                employeeId,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray
                            });
                        } else if (mode === 'check-out') {
                            result = await AttendanceService.checkOut({
                                employeeId,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray
                            });
                        } else {
                            result = await EmployeeService.verifyFace({ employeeId, faceDescriptor: descriptorArray });
                        }

                        setIsSuccess(true);
                        setStatus('Authentication Confirmed');
                        toast.success('Check-point passed.');
                        if (onSuccess) onSuccess(result);

                        setTimeout(() => {
                            setIsSuccess(false);
                            setVerifying(false);
                        }, 3000);

                    } catch (err: any) {
                        const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Access Denied';

                        // Handle both "Already checked in" and "Already checked out" as success states
                        const isAlreadyDone = errorMessage.toLowerCase().includes('already checked in') ||
                            errorMessage.toLowerCase().includes('already checked out');

                        if (isAlreadyDone) {
                            setIsSuccess(true);

                            const isCheckIn = errorMessage.toLowerCase().includes('checked in');
                            // Set status based on the specific message
                            const statusMsg = isCheckIn ? 'Already Checked In Today' : 'Already Checked Out Today';
                            setStatus(statusMsg);

                            toast.success(errorMessage, {
                                icon: '✅',
                                style: {
                                    borderRadius: '10px',
                                    background: '#333',
                                    color: '#fff',
                                },
                            });

                            const statusKey = isCheckIn ? 'already_checked_in' : 'already_checked_out';
                            if (onSuccess) onSuccess({ status: statusKey });

                            setTimeout(() => {
                                setIsSuccess(false);
                                setVerifying(false);
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

        const interval = setInterval(detectFace, 150);
        return () => clearInterval(interval);
    }, [modelsLoaded, framePulse, employeeId, verifying, isSuccess]);

    return (
        <div className="w-full relative flex flex-col items-center">
            <Toaster position="top-right" />

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

                {/* HUD Overlays */}
                <div className="absolute inset-0 pointer-events-none z-20 overflow-hidden">
                    {/* Scanning Line */}
                    <motion.div
                        initial={{ top: '10%' }}
                        animate={{ top: '90%' }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-x-0 h-px bg-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,1)]"
                    />

                    {/* Corner Metadata */}
                    <div className="absolute top-6 left-6 text-[8px] font-mono text-blue-500/60 uppercase tracking-widest space-y-1">
                        <div>REC // Biometric Stream</div>
                        <div>ENC // SHA-256 Protocol</div>
                        <div>SRC // Integrated Sensor</div>
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
            <div className="w-full p-4 bg-slate-900 border-t border-white/5 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isSuccess ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                        <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            {status}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${blinkCount > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Liveness: {blinkCount > 0 ? 'PROVEN' : 'REQUIRED'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${userLocation ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Geofence: {userLocation ? 'SECURED' : 'SYNCING'}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Scan className="w-3 h-3 text-slate-500" />
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter italic">Biometric-V1</span>
                </div>
            </div>
        </div>
    );
};

export default FaceVerify;