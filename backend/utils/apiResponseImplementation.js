// utils/apiResponseImplementation.js

const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString(),
        requestId: res.req.requestId || 'N/A',
        clientIp: res.req.clientIp || 'N/A',
    });
};

const errorResponse = (res, message = 'Internal server error', statusCode = 500, errorDetails = null) => {
    res.status(statusCode).json({
        success: false,
        message,
        error: errorDetails,
        timestamp: new Date().toISOString(),
        requestId: res.req.requestId || 'N/A',
        clientIp: res.req.clientIp || 'N/A',
    });
};

const apiResponseMiddleware = (req, res, next) => {
    res.success = (data, message, statusCode) => successResponse(res, data, message, statusCode);
    res.error = (message, statusCode, errorDetails) => errorResponse(res, message, statusCode, errorDetails);
    next();
};

module.exports = {
    successResponse,
    errorResponse,
    apiResponseMiddleware,
};
