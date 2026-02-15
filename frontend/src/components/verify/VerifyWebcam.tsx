'use client';

import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import toast, { Toaster } from 'react-hot-toast';
import { EmployeeService } from '@/services/employee.service';

const FRAME_WIDTH = 280;
const FRAME_HEIGHT = 340;
const VERIFY_DEBOUNCE_MS = 2000;

interface FaceVerifyProps {
    employeeId: string;
    mode?: 'verify-only' | 'check-in' | 'check-out';
    onSuccess?: (data: any) => void;
}

import { AttendanceService } from '@/services/attendance.service';

const FaceVerify: React.FC<FaceVerifyProps> = ({ employeeId, mode = 'verify-only', onSuccess }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [status, setStatus] = useState('Loading models...');
    const [framePulse, setFramePulse] = useState(false);
    const lastVerifiedRef = useRef<number>(0);

    // Log employeeId for debugging
    useEffect(() => {
        console.log('FaceVerify received employeeId:', employeeId);
    }, [employeeId]);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const modelPath = '/models';
                await faceapi.nets.tinyFaceDetector.loadFromUri(`${modelPath}/tiny_face_detector/`);
                await faceapi.nets.faceLandmark68Net.loadFromUri(`${modelPath}/face_landmark_68_model/`);
                await faceapi.nets.faceRecognitionNet.loadFromUri(`${modelPath}/face_recognition_model/`);
                setModelsLoaded(true);
                setStatus('Show your face inside the frame');
            } catch (err) {
                setStatus('Failed to load models. Please check model files.');
                console.error('Model loading error:', err);
                toast.error('Failed to load face detection models');
            }
        };
        loadModels();
    }, []);

    // Pulse animation
    useEffect(() => {
        const interval = setInterval(() => setFramePulse(prev => !prev), 500);
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

            let color = framePulse ? '#00BFFF' : '#1E90FF'; // Default pulsing blue
            let statusMessage = 'Show your face inside the frame';

            // Validate employeeId
            if (!employeeId || typeof employeeId !== 'string') {
                statusMessage = 'Invalid employee ID';
                color = 'red';
                setStatus(statusMessage);
                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(frameX, frameY, FRAME_WIDTH, FRAME_HEIGHT);
                toast.error(statusMessage);
                return;
            }

            if (detections.length === 0) {
                statusMessage = 'No face detected';
                color = 'red';
            } else if (detections.length > 1) {
                statusMessage = 'Only one face should be detected';
                color = 'red';
            } else {
                const box = detections[0].detection.box;
                const insideFrame =
                    box.x >= frameX &&
                    box.y >= frameY &&
                    box.x + box.width <= frameX + FRAME_WIDTH &&
                    box.y + box.height <= frameY + FRAME_HEIGHT;

                statusMessage = insideFrame ? 'Aligning face...' : 'Move your face inside the frame';
                color = insideFrame ? 'orange' : 'orange';

                // Real-time verification if aligned & debounce
                if (insideFrame && Date.now() - lastVerifiedRef.current > VERIFY_DEBOUNCE_MS) {
                    lastVerifiedRef.current = Date.now();
                    try {
                        const descriptorArray = Array.from(detections[0].descriptor);
                        // Validate descriptor
                        if (!descriptorArray || descriptorArray.length !== 128 || descriptorArray.some(val => typeof val !== 'number' || isNaN(val))) {
                            throw new Error('Invalid face descriptor');
                        }
                        console.log('Sending payload:', { employeeId, faceDescriptor: descriptorArray }); // Debug log

                        let result;
                        if (mode === 'check-in') {
                            result = await AttendanceService.checkIn({
                                employeeId,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray
                            });
                            statusMessage = `Check-in successful! Time: ${new Date(result.data.checkInTime).toLocaleTimeString()}`;
                        } else if (mode === 'check-out') {
                            result = await AttendanceService.checkOut({
                                employeeId,
                                method: 'face_verification',
                                faceDescriptor: descriptorArray
                            });
                            statusMessage = `Check-out successful! Time: ${new Date(result.data.checkOutTime).toLocaleTimeString()}`;
                        } else {
                            // Default verify-only
                            result = await EmployeeService.verifyFace({ employeeId, faceDescriptor: descriptorArray });
                            statusMessage = `Face verified! Similarity: ${result.similarity.toFixed(2)}`;
                        }

                        color = 'lime';
                        toast.success(statusMessage);
                        if (onSuccess) onSuccess(result);
                    } catch (err: unknown) {
                        // Extract server error message
                        const errorMessage = err instanceof Error ? err.message : 'Face verification failed';
                        statusMessage = errorMessage; // Display "Employee not found" or other server error
                        color = 'red';
                        console.error('Verification error:', err);
                        toast.error(statusMessage);
                    }
                }
            }

            setStatus(statusMessage);

            // Draw frame
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.strokeRect(frameX, frameY, FRAME_WIDTH, FRAME_HEIGHT);
        };

        const interval = setInterval(detectFace, 200);
        return () => clearInterval(interval);
    }, [modelsLoaded, framePulse, employeeId]);

    return (
        <div className="flex flex-col items-center gap-4 p-4">
            <Toaster position="top-right" />
            <div className="relative w-[640px] h-[480px] border rounded-lg overflow-hidden shadow-lg">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={640}
                    height={480}
                    videoConstraints={{ width: 640, height: 480, facingMode: 'user' }}
                    className="absolute top-0 left-0 object-cover w-full h-full"
                />
                <canvas
                    ref={canvasRef}
                    width={640}
                    height={480}
                    className="absolute top-0 left-0"
                />
            </div>
            <p className={`text-lg font-semibold ${status.includes('verified') ? 'text-green-500' : 'text-red-500'}`}>
                {status}
            </p>
        </div>
    );
};

export default FaceVerify;