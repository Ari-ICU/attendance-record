const Joi = require('joi');

const phonePattern = /^\+?[1-9]\d{1,14}$/;

const employeeCreateSchema = Joi.object({
    firstName: Joi.string().trim().max(50).required(),
    lastName: Joi.string().trim().max(50).required(),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase().required(),
    phone: Joi.string().trim().pattern(phonePattern).required(),
    position: Joi.string().trim().required(),
    department: Joi.string().trim().required(),
    dateOfJoining: Joi.date().required(),
    photoUrl: Joi.string().optional().allow(null, ''), // New field
    faceDescriptor: Joi.array().items(Joi.number()).optional().allow(null), // Optional 128-d face descriptor
    faceVerifiedAt: Joi.date().optional().allow(null),
    faceVerificationEnabled: Joi.boolean().optional().default(false),
    isActive: Joi.boolean().optional().default(true)
});

const employeeUpdateSchema = Joi.object({
    firstName: Joi.string().trim().max(50),
    lastName: Joi.string().trim().max(50),
    email: Joi.string().email({ tlds: { allow: false } }).trim().lowercase(),
    phone: Joi.string().trim().pattern(phonePattern),
    position: Joi.string().trim(),
    department: Joi.string().trim(),
    dateOfJoining: Joi.date(),
    photoUrl: Joi.string().optional().allow(null, ''),
    faceDescriptor: Joi.array().items(Joi.number()).optional().allow(null),
    faceVerifiedAt: Joi.date().optional().allow(null),
    faceVerificationEnabled: Joi.boolean().optional(),
    isActive: Joi.boolean()
}).min(1);

const employeeQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    department: Joi.string().optional(),
    position: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    sortBy: Joi.string().valid('firstName', 'lastName', 'email', 'createdAt').default('createdAt'),
    sortOrder: Joi.string().valid('asc','desc').default('desc')
});

module.exports = {
    employeeCreateSchema,
    employeeUpdateSchema,
    employeeQuerySchema
};
