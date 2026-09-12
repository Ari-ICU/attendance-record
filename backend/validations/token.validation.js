const Joi = require('joi');

// Login validation (email or employeeId)
const loginSchema = Joi.object({
    identifier: Joi.alternatives().try(
        Joi.string().email().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email or Employee ID is required',
        }),
        Joi.string().pattern(/^[A-Za-z0-9]{6,12}$/).messages({
            'string.pattern.base': 'Employee ID must be 6-12 alphanumeric characters',
            'string.empty': 'Email or Employee ID is required',
        })
    ).required(),
    password: Joi.string().min(6).trim().required().messages({
        'string.empty': 'Password is required',
        'string.min': 'Password must be at least 6 characters long',
        'string.base': 'Password must be a string',
    }),
});

// Refresh token validation
const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string().trim().required().messages({
        'string.empty': 'Refresh token is required',
        'string.base': 'Refresh token must be a string',
    }),
});

// Logout validation (refresh token required)
const logoutSchema = Joi.object({
    refreshToken: Joi.string().trim().required().messages({
        'string.empty': 'Refresh token is required',
        'string.base': 'Refresh token must be a string',
    }),
});

// Profile update validation
const userUpdateSchema = Joi.object({
    email: Joi.string().email().trim().optional().messages({
        'string.email': 'Please provide a valid email address',
        'string.base': 'Email must be a string',
    }),
    username: Joi.string().alphanum().min(3).max(30).trim().optional().messages({
        'string.alphanum': 'Username must contain only letters and numbers',
        'string.min': 'Username must be at least 3 characters long',
        'string.max': 'Username cannot exceed 30 characters',
        'string.base': 'Username must be a string',
    }),
    password: Joi.string().min(6).trim().optional().messages({
        'string.min': 'Password must be at least 6 characters long',
        'string.base': 'Password must be a string',
    }),
}).or('email', 'username', 'password').messages({
    'object.missing': 'At least one field (email, username, or password) must be provided',
});

module.exports = {
    loginSchema,
    refreshTokenSchema,
    logoutSchema,
    userUpdateSchema,
};