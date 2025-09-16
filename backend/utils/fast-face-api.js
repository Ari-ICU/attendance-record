// fast-face-api.js
const faceapi = require('@vladmandic/face-api');
const canvas = require('canvas');
const path = require('path');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODEL_PATH = path.join(__dirname, '../models/face');

let modelsLoaded = false;

/**
 * Load models once (singleton pattern)
 */
async function initModels() {
    if (modelsLoaded) return;
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH),
        faceapi.nets.faceLandmark68Net.loadFromDisk(MODEL_PATH),
        faceapi.nets.faceRecognitionNet.loadFromDisk(MODEL_PATH),
    ]);
    modelsLoaded = true;
    console.log('Face-api models loaded (fast)');
}

/**
 * Get face descriptor from image buffer
 */
async function getDescriptor(imageBuffer) {
    if (!modelsLoaded) await initModels();
    const img = await canvas.loadImage(imageBuffer);
    const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
    if (!detection) throw new Error('No face detected in image');
    return detection.descriptor;
}

/**
 * Cosine similarity between two descriptors
 */
function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) throw new Error('Descriptor length mismatch');
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] ** 2;
        normB += b[i] ** 2;
    }
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

module.exports = { initModels, getDescriptor, cosineSimilarity };
