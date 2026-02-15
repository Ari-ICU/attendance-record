require('dotenv').config();
const util = require('util');
// Shim for deprecated util functions removed in newer Node versions, required by tfjs-node
if (!util.isNullOrUndefined) {
    util.isNullOrUndefined = (arg) => arg === null || arg === undefined;
}
if (!util.isNumber) {
    util.isNumber = (arg) => typeof arg === 'number';
}
if (!util.isString) {
    util.isString = (arg) => typeof arg === 'string';
}

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const requestIp = require('request-ip');
const { v4: uuidv4 } = require('uuid');
const timeout = require('express-timeout-handler');
const responseTime = require('response-time');
const { corsMiddleware, handleCorsError } = require('./middlewares/cors.middleware');
const { generalLimiter, getRateLimitStatus } = require('./middlewares/rateLimits.middleware');
const { connectToMongoDB, checkMongoDBHealth } = require('./config/mongo.config');
const { connectToRedis, checkRedisHealth } = require('./config/redis.config');
const { initializeSocketIO, checkSocketIOHealth } = require('./config/socket.config');
const { apiResponseMiddleware } = require('./utils/apiResponseImplementation');

// Import permission system components
const authRoutes = require('./routes/auth.routes');
const attendanceRoutes = require('./routes/attendance.routes');
const workScheduleRoutes = require('./routes/workSchedule.routes');
const employeeRoutes = require('./routes/employee.route');
const departmentRoutes = require('./routes/department.routes');
const systemSettingRoutes = require('./routes/systemSetting.routes');
const payrollRoutes = require('./routes/payroll.routes');


const { initializeAdminAndPermissions } = require('./utils/initAdminUser');
const systemSettingService = require('./services/systemSetting.service');




const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting and IP detection)
app.set('trust proxy', 1);

// Security headers middleware (Helmet)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
        },
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // Enforce HTTPS
}));

// Compression middleware to reduce response size
app.use(compression({
    level: 6, // Compression level (1-9, higher is more compression but slower)
    threshold: 1024, // Only compress responses larger than 1KB
}));

// Request logging middleware (Morgan)
app.use(morgan('combined', {
    skip: (req, res) => process.env.NODE_ENV === 'test', // Skip logging in test environment
}));

// Request ID middleware
app.use((req, res, next) => {
    req.requestId = uuidv4();
    res.setHeader('X-Request-ID', req.requestId);
    next();
});

// Client IP middleware
app.use(requestIp.mw());

// Request timeout middleware
app.use(timeout.handler({
    timeout: 15000, // 15 seconds timeout
    onTimeout: (req, res) => {
        res.status(504).json({
            success: false,
            message: 'Request timed out',
            requestId: req.requestId,
        });
    },
}));

// Response time middleware (adds X-Response-Time header)
app.use(responseTime());

// API response middleware
app.use(apiResponseMiddleware);

// CORS middleware - must be before other middleware
app.use(corsMiddleware);

app.use(cookieParser());
// General rate limiting - apply to all routes
app.use(generalLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Basic route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Hello from attendance record backend 🚀',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        requestId: req.requestId,
        clientIp: req.clientIp,
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    const mongoHealth = checkMongoDBHealth();
    const redisHealth = checkRedisHealth();
    const socketHealth = checkSocketIOHealth();
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: mongoHealth,
        cache: redisHealth,
        websocket: socketHealth,
        requestId: req.requestId,
        clientIp: req.clientIp,
    });
});

// Rate limit status endpoint
app.get('/rate-limit-status', getRateLimitStatus);

// API Routes

// Authentication routes (public)
app.use('/api/auth', authRoutes);

// employee route
app.use('/api/employees', employeeRoutes)
app.use('/api/departments', departmentRoutes)

// work-schedule route
app.use('/api/work-schedule', workScheduleRoutes)

// Attendance routes (protected with permissions)
app.use('/api/attendance', attendanceRoutes);

// System settings routes
app.use('/api/settings', systemSettingRoutes);

// Payroll routes
app.use('/api/payroll', payrollRoutes);



// CORS error handling middleware
app.use(handleCorsError);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        requestId: req.requestId,
        clientIp: req.clientIp,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`Global Error Handler [Request ID: ${req.requestId}]:`, err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        requestId: req.requestId,
        clientIp: req.clientIp,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
});

async function startServer() {
    try {
        // Use simple port configuration
        const PORT = process.env.PORT || 4000;

        // Try to connect to databases, but don't fail if they're not available
        console.log('🔄 Starting server initialization...');

        // Connect to MongoDB
        try {
            await connectToMongoDB();
            console.log('✅ MongoDB connected successfully');

            // Initialize admin user AFTER MongoDB connection
            try {
                console.log('🔄 Initializing admin user...');
                await initializeAdminAndPermissions();
                console.log('✅ Admin user initialized successfully');

                // Initialize system settings
                await systemSettingService.initializeDefaults();
                console.log('✅ System settings initialized');
            } catch (adminError) {

                console.warn('⚠️ Admin user initialization failed:', adminError.message);
            }
        } catch (mongoError) {
            console.warn('⚠️ MongoDB connection failed:', mongoError.message);
            console.warn('⚠️ Server will start without database connection');
            console.warn('⚠️ Make sure MongoDB is running for full functionality');
        }

        // Connect to Redis
        try {
            await connectToRedis();
        } catch (redisError) {
            console.warn('⚠️ Redis connection failed:', redisError.message);
            console.warn('⚠️ Server will start without cache layer');
            console.warn('⚠️ Make sure Redis is running for caching functionality');
        }

        // Start the HTTP server
        const httpServer = app.listen(PORT, () => {
            console.log(`🚀 Server running at http://localhost:${PORT}`);
            console.log(`📊 Health check available at http://localhost:${PORT}/health`);
            console.log(`📈 Rate limit status available at http://localhost:${PORT}/rate-limit-status`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        });

        // Initialize Socket.IO with HTTP server
        try {
            initializeSocketIO(httpServer);
        } catch (socketError) {
            console.warn('⚠️ Socket.IO initialization failed:', socketError.message);
            console.warn('⚠️ Real-time features will not be available');
        }
    } catch (err) {
        console.error('❌ Error starting server:', err.message);
        process.exit(1);
    }
}

startServer();