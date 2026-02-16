const cors = require('cors');

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Default allowed origins
const defaultOrigins = [
    'http://localhost:3000',    // Next.js development server
    'http://localhost:3001',    // Alternative frontend port
    'http://127.0.0.1:3000',    // Localhost alternative
    'http://127.0.0.1:3001'     // Localhost alternative
];

// Production origins (add your production domains here)
const productionOrigins = [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://app.yourdomain.com'
];

// Get allowed origins based on environment
const getAllowedOrigins = () => {
    if (isProduction) {
        return productionOrigins;
    }

    // In development, allow all localhost origins
    if (isDevelopment) {
        return [
            ...defaultOrigins,
            /^http:\/\/localhost:\d+$/,  // Any localhost port
            /^http:\/\/127\.0\.0\.1:\d+$/ // Any 127.0.0.1 port
        ];
    }

    // Default fallback
    return defaultOrigins;
};

// CORS options configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = getAllowedOrigins();

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }

        // Check if origin is allowed
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return allowedOrigin === origin;
            } else if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocked request from origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },

    // HTTP methods allowed
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
        'HEAD'
    ],

    // Headers allowed in requests
    allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'Cache-Control',
        'Pragma',
        'X-API-Key',
        'X-Request-ID',
        'X-Client-Version',
        'X-Device-ID'
    ],

    // Headers exposed to the client
    exposedHeaders: [
        'X-Total-Count',
        'X-Page-Count',
        'X-Current-Page',
        'X-Per-Page',
        'X-Rate-Limit-Remaining',
        'X-Rate-Limit-Reset',
        'X-Request-ID'
    ],

    // Allow credentials (cookies, authorization headers)
    credentials: true,

    // Cache preflight response for 24 hours
    maxAge: 86400,

    // Handle preflight requests
    preflightContinue: false,
    optionsSuccessStatus: 200
};

// Create CORS middleware
const corsMiddleware = cors(corsOptions);

// Custom CORS middleware with additional logging and error handling
const customCorsMiddleware = (req, res, next) => {
    const origin = req.get('Origin');

    // Log CORS requests in development
    if (isDevelopment) {
        console.log(`CORS Request: ${req.method} ${req.path} from ${origin || 'No Origin'}`);
    }

    // Apply CORS middleware
    corsMiddleware(req, res, (err) => {
        if (err) {
            // Log CORS errors
            console.error('CORS Error:', {
                origin: origin,
                method: req.method,
                path: req.path,
                error: err.message
            });

            // Return CORS error response
            return res.status(403).json({
                success: false,
                message: 'CORS policy violation',
                error: isDevelopment ? err.message : 'Access denied'
            });
        }

        // Headers are already set by the cors package based on corsOptions
        // Manually setting them again can cause double headers which browsers reject

        next();
    });
};

// Specific CORS configurations for different routes
const corsConfigurations = {
    // Public API routes (less restrictive)
    public: cors({
        origin: getAllowedOrigins(),
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
        credentials: true
    }),

    // Authentication routes (more restrictive)
    auth: cors({
        origin: getAllowedOrigins(),
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
        credentials: true,
        maxAge: 3600 // 1 hour cache for auth preflight
    }),

    // Admin routes (most restrictive)
    admin: cors({
        origin: isProduction ? productionOrigins : getAllowedOrigins(),
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-API-Key',
            'X-Admin-Token'
        ],
        credentials: true,
        maxAge: 1800 // 30 minutes cache for admin preflight
    }),

    // File upload routes
    upload: cors({
        origin: getAllowedOrigins(),
        methods: ['POST', 'OPTIONS'],
        allowedHeaders: [
            'Content-Type',
            'Accept',
            'Authorization',
            'X-File-Size',
            'X-File-Type'
        ],
        credentials: true,
        maxAge: 7200 // 2 hours cache for upload preflight
    })
};

// Middleware to set CORS headers for specific route types
const setCorsForRoute = (routeType) => {
    return (req, res, next) => {
        const config = corsConfigurations[routeType];
        if (config) {
            config(req, res, next);
        } else {
            customCorsMiddleware(req, res, next);
        }
    };
};

// Utility function to check if origin is allowed
const isOriginAllowed = (origin) => {
    const allowedOrigins = getAllowedOrigins();
    return allowedOrigins.some(allowedOrigin => {
        if (typeof allowedOrigin === 'string') {
            return allowedOrigin === origin;
        } else if (allowedOrigin instanceof RegExp) {
            return allowedOrigin.test(origin);
        }
        return false;
    });
};

// Middleware to handle CORS errors gracefully
const handleCorsError = (err, req, res, next) => {
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({
            success: false,
            message: 'CORS policy violation',
            error: isDevelopment ? err.message : 'Access denied',
            origin: req.get('Origin'),
            allowedOrigins: isDevelopment ? getAllowedOrigins() : undefined
        });
    }
    next(err);
};

// Export configurations
module.exports = {
    corsMiddleware: customCorsMiddleware,
    corsConfigurations,
    setCorsForRoute,
    isOriginAllowed,
    handleCorsError,
    corsOptions,
    getAllowedOrigins
};
