const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit'); // Import ipKeyGenerator
const { isOriginAllowed } = require('./cors.middleware');

// Environment-based configuration
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

// Custom key generator for rate limiting
const keyGenerator = (req) => {
    if (req.user && req.user.id) {
        return `user:${req.user.id}`;
    }
    if (req.headers['x-api-key']) {
        return `api:${req.headers['x-api-key']}`;
    }
    return `ip:${ipKeyGenerator(req)}`; // Use ipKeyGenerator for safe IP handling
};

// Custom skip function for trusted origins
const skipSuccessfulRequests = (req, res) => {
    const origin = req.get('Origin');
    if (origin && isOriginAllowed(origin) && res.statusCode < 400) {
        return true;
    }
    return false;
};

// Custom skip function for development
const skipInDevelopment = (req, res) => {
    return isDevelopment && req.get('Origin') && isOriginAllowed(req.get('Origin'));
};

// Base rate limit configuration
const baseConfig = {
    keyGenerator, // Now keyGenerator is defined before this
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests, please try again later',
        retryAfter: null
    },
    handler: (req, res, next, options) => {
        const retryAfter = Math.round(options.windowMs / 1000);
        res.status(options.statusCode).json({
            success: false,
            message: options.message.message,
            retryAfter: retryAfter,
            limit: options.max,
            remaining: 0,
            resetTime: new Date(Date.now() + options.windowMs).toISOString(),
            ...(isDevelopment && {
                key: keyGenerator(req),
                windowMs: options.windowMs
            })
        });
    }
};

// General API rate limiting
const generalLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: isDevelopment ? 1000 : 100,
    skip: skipInDevelopment,
    message: {
        success: false,
        message: 'Too many API requests, please try again later'
    }
});

// Authentication rate limiting (stricter)
const authLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 100 : 5,
    skip: false,
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later'
    },
    handler: (req, res, next, options) => {
        const retryAfter = Math.round(options.windowMs / 1000);
        console.warn(`Auth rate limit exceeded for ${keyGenerator(req)}`);
        res.status(options.statusCode).json({
            success: false,
            message: 'Too many authentication attempts, please try again later',
            retryAfter: retryAfter,
            limit: options.max,
            remaining: 0,
            resetTime: new Date(Date.now() + options.windowMs).toISOString(),
            type: 'auth_rate_limit'
        });
    }
});

// Password reset rate limiting (very strict)
const passwordResetLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: isDevelopment ? 10 : 3,
    skip: false,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later'
    },
    handler: (req, res, next, options) => {
        const retryAfter = Math.round(options.windowMs / 1000);
        console.warn(`Password reset rate limit exceeded for ${keyGenerator(req)}`);
        res.status(options.statusCode).json({
            success: false,
            message: 'Too many password reset attempts, please try again later',
            retryAfter: retryAfter,
            limit: options.max,
            remaining: 0,
            resetTime: new Date(Date.now() + options.windowMs).toISOString(),
            type: 'password_reset_rate_limit'
        });
    }
});

// File upload rate limiting
const uploadLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: isDevelopment ? 100 : 20,
    skip: skipInDevelopment,
    message: {
        success: false,
        message: 'Too many file uploads, please try again later'
    }
});

// Admin operations rate limiting
const adminLimiter = rateLimit({
    ...baseConfig,
    windowMs: 5 * 60 * 1000,
    max: isDevelopment ? 200 : 50,
    skip: skipInDevelopment,
    message: {
        success: false,
        message: 'Too many admin operations, please try again later'
    }
});

// User registration rate limiting
const registrationLimiter = rateLimit({
    ...baseConfig,
    windowMs: 60 * 60 * 1000,
    max: isDevelopment ? 50 : 5,
    skip: false,
    message: {
        success: false,
        message: 'Too many registration attempts, please try again later'
    },
    handler: (req, res, next, options) => {
        const retryAfter = Math.round(options.windowMs / 1000);
        console.warn(`Registration rate limit exceeded for ${keyGenerator(req)}`);
        res.status(options.statusCode).json({
            success: false,
            message: 'Too many registration attempts, please try again later',
            retryAfter: retryAfter,
            limit: options.max,
            remaining: 0,
            resetTime: new Date(Date.now() + options.windowMs).toISOString(),
            type: 'registration_rate_limit'
        });
    }
});

// Email verification rate limiting
const emailVerificationLimiter = rateLimit({
    ...baseConfig,
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 20 : 3,
    skip: false,
    message: {
        success: false,
        message: 'Too many email verification attempts, please try again later'
    }
});

// Search rate limiting
const searchLimiter = rateLimit({
    ...baseConfig,
    windowMs: 1 * 60 * 1000,
    max: isDevelopment ? 100 : 30,
    skip: skipInDevelopment,
    message: {
        success: false,
        message: 'Too many search requests, please try again later'
    }
});

// Report generation rate limiting
const reportLimiter = rateLimit({
    ...baseConfig,
    windowMs: 10 * 60 * 1000,
    max: isDevelopment ? 50 : 10,
    skip: skipInDevelopment,
    message: {
        success: false,
        message: 'Too many report generation requests, please try again later'
    }
});

// Strict rate limiting for sensitive operations
const strictLimiter = rateLimit({
    ...baseConfig,
    windowMs: 5 * 60 * 1000,
    max: isDevelopment ? 20 : 5,
    skip: false,
    message: {
        success: false,
        message: 'Too many requests for this sensitive operation, please try again later'
    }
});

// Rate limit configurations for different route types
const rateLimitConfigs = {
    general: generalLimiter,
    auth: authLimiter,
    passwordReset: passwordResetLimiter,
    upload: uploadLimiter,
    admin: adminLimiter,
    registration: registrationLimiter,
    emailVerification: emailVerificationLimiter,
    search: searchLimiter,
    report: reportLimiter,
    strict: strictLimiter
};

// Middleware to apply rate limiting based on route type
const applyRateLimit = (type = 'general') => {
    const limiter = rateLimitConfigs[type];
    if (!limiter) {
        console.warn(`Rate limit type '${type}' not found, using general limiter`);
        return rateLimitConfigs.general;
    }
    return limiter;
};

// Custom rate limiter factory
const createCustomRateLimit = (options = {}) => {
    const defaultOptions = {
        windowMs: 15 * 60 * 1000,
        max: 100,
        keyGenerator,
        standardHeaders: true,
        legacyHeaders: false,
        skip: skipInDevelopment
    };
    return rateLimit({
        ...defaultOptions,
        ...options,
        ...baseConfig
    });
};

// Rate limit status middleware
const getRateLimitStatus = (req, res, next) => {
    const key = keyGenerator(req);
    res.json({
        success: true,
        key: key,
        environment: process.env.NODE_ENV || 'development',
        rateLimits: {
            general: { windowMs: 15 * 60 * 1000, max: isDevelopment ? 1000 : 100 },
            auth: { windowMs: 15 * 60 * 1000, max: isDevelopment ? 100 : 5 },
            passwordReset: { windowMs: 60 * 60 * 1000, max: isDevelopment ? 10 : 3 },
            upload: { windowMs: 60 * 60 * 1000, max: isDevelopment ? 100 : 20 },
            admin: { windowMs: 5 * 60 * 1000, max: isDevelopment ? 200 : 50 },
            registration: { windowMs: 60 * 60 * 1000, max: isDevelopment ? 50 : 5 }
        }
    });
};

// Export all rate limiters and utilities
module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter,
    adminLimiter,
    registrationLimiter,
    emailVerificationLimiter,
    searchLimiter,
    reportLimiter,
    strictLimiter,
    rateLimitConfigs,
    applyRateLimit,
    createCustomRateLimit,
    getRateLimitStatus,
    keyGenerator
};