const Joi = require('joi');

// Common patterns
const phonePattern = /^\+?[1-9]\d{1,14}$/;

// User registration schema
const userRegistrationSchema = Joi.object({
    username: Joi.string().trim().max(50).required()
        .messages({
            'string.empty': 'Username is required',
            'string.max': 'Username cannot exceed 50 characters'
        }),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required()
        .messages({
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        }),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters',
            'string.pattern.base': 'Password must contain uppercase, lowercase, and number'
        }),
    loginAttempts: Joi.number().integer().min(0).default(0),
    isLocked: Joi.boolean().default(false),
    lastLogin: Joi.date().optional()
});

// User update schema (at least one field required)
const userUpdateSchema = Joi.object({
    username: Joi.string().trim().max(50),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase(),
    password: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
    firstName: Joi.string().trim().max(50).allow('', null),
    lastName: Joi.string().trim().max(50).allow('', null),
    photoUrl: Joi.string().trim().allow('', null),
    bio: Joi.string().trim().max(1000).allow('', null),
    position: Joi.string().trim().max(100).allow('', null),
    department: Joi.string().trim().max(100).allow('', null),
    phoneNumber: Joi.string().trim().max(20).allow('', null),
    location: Joi.string().trim().max(100).allow('', null),
    loginAttempts: Joi.number().integer().min(0),
    isLocked: Joi.boolean(),
    lastLogin: Joi.date()
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Login schema
const loginSchema = Joi.object({
    identifier: Joi.string().trim().required().messages({
        'string.empty': 'Email or Username is required'
    }),
    password: Joi.string().required().messages({
        'string.empty': 'Password is required'
    })
});

// Password change schema
const passwordChangeSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
});

// User query schema for listing/filtering
const userQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().valid('username', 'email', 'createdAt', 'lastLogin').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
    userRegistrationSchema,
    userUpdateSchema,
    loginSchema,
    passwordChangeSchema,
    userQuerySchema
};
