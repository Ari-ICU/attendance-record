process.env.TZ = 'Asia/Phnom_Penh';
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { connectToMongoDB, checkMongoDBHealth } = require('./config/mongo.config');

const app = express();
const PORT = process.env.PORT || 5000;

// Core Middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : '*',
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Health Check Endpoint
app.get('/health', (req, res) => {
    const mongoHealth = checkMongoDBHealth();
    res.status(200).json({
        success: true,
        message: 'Backend server operational',
        timestamp: new Date().toISOString(),
        database: mongoHealth,
        environment: process.env.NODE_ENV || 'development'
    });
});

// API Root
app.get('/api', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'StaffFlow API v1.0 • Ready for new endpoints'
    });
});

// Global 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `API route not found: ${req.method} ${req.originalUrl}`
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Start Server
const startServer = async () => {
    try {
        await connectToMongoDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server listening on http://localhost:${PORT}`);
            console.log(`🏥 Health check available at http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('Failed to start server:', error.message);
        process.exit(1);
    }
};

startServer();

module.exports = app;