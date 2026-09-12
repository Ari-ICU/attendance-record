const Joi = require('joi');

// Time pattern HH:MM 24-hour format
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

const workScheduleSchemaJoi = Joi.object({
    date: Joi.date().required()
        .messages({
            'date.base': 'Date must be valid',
            'any.required': 'Date is required'
        }),
    shift: Joi.string().valid('morning', 'afternoon', 'night').required()
        .messages({
            'any.only': 'Shift must be one of: morning, afternoon, night',
            'any.required': 'Shift is required'
        }),
    startTime: Joi.string().pattern(timePattern).required()
        .messages({
            'string.pattern.base': 'Start time must be in HH:MM 24-hour format',
            'any.required': 'Start time is required'
        }),
    endTime: Joi.string().pattern(timePattern).required()
        .messages({
            'string.pattern.base': 'End time must be in HH:MM 24-hour format',
            'any.required': 'End time is required'
        }),
    verifiedByRole: Joi.string().valid('admin', 'manager').optional()
        .messages({
            'any.only': 'Verified by role must be either admin or manager'
        }),
    verifiedAt: Joi.date().optional()
        .messages({
            'date.base': 'Verified at must be a valid date'
        })
});

module.exports = {
    workScheduleSchemaJoi
};
