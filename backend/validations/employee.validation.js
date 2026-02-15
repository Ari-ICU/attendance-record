const Joi = require('joi');

const phonePattern = /^\+?[0-9\s\-()]{7,20}$/;

const employeeCreateSchema = Joi.object({
    firstName: Joi.string().trim().max(50).required(),
    lastName: Joi.string().trim().max(50).required(),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
    phone: Joi.string().trim().pattern(phonePattern).required(),
    position: Joi.string().trim().required(),
    department: Joi.string().trim().optional().allow('', null),
    type: Joi.string().valid('employee', 'student').default('employee'),
    dateOfJoining: Joi.date().required(),
    photoUrl: Joi.string().optional().allow(null, ''),
    faceDescriptor: Joi.array().items(Joi.number()).optional().allow(null),
    faceVerifiedAt: Joi.date().optional().allow(null),
    faceVerificationEnabled: Joi.boolean().optional().default(false),
    isActive: Joi.boolean().optional().default(true),
    baseSalary: Joi.number().min(0).optional().default(0),
    hourlyRate: Joi.number().min(0).optional().default(0),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').default('USD')
});

const employeeUpdateSchema = Joi.object({
    firstName: Joi.string().trim().max(50),
    lastName: Joi.string().trim().max(50),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase(),
    phone: Joi.string().trim().pattern(phonePattern),
    position: Joi.string().trim(),
    department: Joi.string().trim().optional().allow('', null),
    type: Joi.string().valid('employee', 'student'),
    dateOfJoining: Joi.date(),
    photoUrl: Joi.string().optional().allow(null, ''),
    faceDescriptor: Joi.array().items(Joi.number()).optional().allow(null),
    faceVerifiedAt: Joi.date().optional().allow(null),
    faceVerificationEnabled: Joi.boolean().optional(),
    isActive: Joi.boolean(),
    baseSalary: Joi.number().min(0).optional(),
    hourlyRate: Joi.number().min(0).optional(),
    currency: Joi.string().valid('USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD').optional()
}).min(1);

const employeeQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(1000).default(10),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    type: Joi.string().valid('employee', 'student').optional(),
    sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc')
});

module.exports = {
    employeeCreateSchema,
    employeeUpdateSchema,
    employeeQuerySchema
};
