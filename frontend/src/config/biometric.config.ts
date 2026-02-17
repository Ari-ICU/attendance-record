/**
 * BIOMETRIC MODEL CONFIGURATION
 * Centralized settings for face detection and geofencing.
 */
export const BIOMETRIC_CONFIG = {
    // model: 'tinyFaceDetector' (Fast, 1.8MB) or 'ssdMobilenetv1' (Accurate, 5.4MB)
    detector: 'tinyFaceDetector' as 'tinyFaceDetector' | 'ssdMobilenetv1',

    // For TinyFaceDetector: Higher = more accurate but slower. Standard: 160, 224, 320, 416, 512, 608
    inputSize: 224, // Reduced from 416 for heat optimization

    // Confidence threshold (0.1 to 0.9). Higher = stricter detection.
    scoreThreshold: 0.5,

    // Minimum confidence for SSD Mobilenet (0.1 to 0.9)
    minConfidence: 0.5,

    // If true, scanning will FAIL if geolocation is blocked or outside range.
    requireGeofence: true,

    // Auto-bypass liveness check (Set to true for fully automatic scan)
    bypassLiveness: false,

    // Performance settings
    fpsLimit: 15,
    verifyDebounceMs: 2000,
    identifyIntervalMs: 3000,

    // Visual settings
    frameWidth: 280,
    frameHeight: 340,
};

export const DEFAULT_OFFICE_LOCATION = {
    lat: 11.5564,
    lng: 104.9282,
    range: 50
};
