const Joi = require('joi');

const locationSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).messages({
        'number.base': 'Latitude must be a number',
        'number.min': 'Latitude must be between -90 and 90',
        'number.max': 'Latitude must be between -90 and 90'
    }),
    longitude: Joi.number().min(-180).max(180).messages({
        'number.base': 'Longitude must be a number',
        'number.min': 'Longitude must be between -180 and 180',
        'number.max': 'Longitude must be between -180 and 180'
    }),
    address: Joi.string().trim().max(200).allow('').messages({
        'string.max': 'Address cannot exceed 200 characters'
    })
});

const deviceInfoSchema = Joi.object({
    platform: Joi.string().trim().max(50).allow('').messages({
        'string.max': 'Platform cannot exceed 50 characters'
    }),
    browser: Joi.string().trim().max(50).allow('').messages({
        'string.max': 'Browser cannot exceed 50 characters'
    })
});

const faceVerificationSchema = Joi.object({
    verificationId: Joi.string().trim().max(100).messages({
        'string.max': 'Verification ID cannot exceed 100 characters'
    }),
    confidenceScore: Joi.number().min(0).max(100).messages({
        'number.base': 'Confidence score must be a number',
        'number.min': 'Confidence score cannot be negative',
        'number.max': 'Confidence score cannot exceed 100'
    })
});

deviceInfo: deviceInfoSchema.optional(),
    platform: Joi.string().optional(),
        browser: Joi.string().optional(),
            faceDescriptor: Joi.array().items(Joi.number()).optional(),
                faceImage: Joi.string().when('method', {
                    is: 'face_verification',
                    then: Joi.when('faceDescriptor', {
                        is: Joi.exist(),
                        then: Joi.optional(),
                        otherwise: Joi.required()
                    }).messages({
                        'any.required': 'Face image or descriptor is required for face_verification method'
                    }),
                    otherwise: Joi.forbidden()
                })
});

deviceInfo: deviceInfoSchema.optional(),
    platform: Joi.string().optional(),
        browser: Joi.string().optional(),
            faceDescriptor: Joi.array().items(Joi.number()).optional(),
                faceImage: Joi.string().when('method', {
                    is: 'face_verification',
                    then: Joi.when('faceDescriptor', {
                        is: Joi.exist(),
                        then: Joi.optional(),
                        otherwise: Joi.required()
                    }).messages({
                        'any.required': 'Face image or descriptor is required for face_verification method'
                    }),
                    otherwise: Joi.forbidden()
                })
});

const breakSchema = Joi.object({
    startTime: Joi.date().required().messages({
        'date.base': 'Start time must be a valid date',
        'any.required': 'Start time is required'
    }),
    endTime: Joi.date().required().messages({
        'date.base': 'End time must be a valid date',
        'any.required': 'End time is required'
    }),
    type: Joi.string().valid('lunch', 'coffee', 'personal', 'meeting', 'other').default('other').messages({
        'any.only': 'Break type must be one of: lunch, coffee, personal, meeting, other'
    }),
    description: Joi.string().trim().max(200).allow('').messages({
        'string.max': 'Break description cannot exceed 200 characters'
    })
});

const overtimeSchema = Joi.object({
    hours: Joi.number().min(0).max(24).default(0).messages({
        'number.base': 'Overtime hours must be a number',
        'number.min': 'Overtime hours cannot be negative',
        'number.max': 'Overtime hours cannot exceed 24'
    }),
    type: Joi.string().valid('regular', 'holiday', 'weekend').default('regular').messages({
        'any.only': 'Overtime type must be one of: regular, holiday, weekend'
    }),
    approved: Joi.boolean().default(false).messages({
        'boolean.base': 'Approved must be true or false'
    })
});

const remoteWorkSchema = Joi.object({
    isRemote: Joi.boolean().default(false).messages({
        'boolean.base': 'isRemote must be true or false'
    }),
    location: Joi.string().trim().max(200).allow('').messages({
        'string.max': 'Remote work location cannot exceed 200 characters'
    }),
    reason: Joi.string().trim().max(500).allow('').messages({
        'string.max': 'Remote work reason cannot exceed 500 characters'
    })
});

const attendanceCreateSchema = Joi.object({
    employeeId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid employee ID format',
        'any.required': 'Employee ID is required'
    }),
    date: Joi.date().max('now').default(Date.now).messages({
        'date.base': 'Date must be a valid date',
        'date.max': 'Date cannot be in the future'
    }),
    checkIn: Joi.object({
        time: Joi.date().max('now').messages({
            'date.base': 'Check-in time must be a valid date',
            'date.max': 'Check-in time cannot be in the future'
        }),
        location: locationSchema.optional(),
        method: Joi.string().valid('manual', 'qr_code', 'gps', 'biometric', 'face_verification').default('manual'),
        deviceInfo: deviceInfoSchema.optional(),
        faceVerificationData: faceVerificationSchema.optional()
    }).optional(),
    checkOut: Joi.object({
        time: Joi.date().max('now').messages({
            'date.base': 'Check-out time must be a valid date',
            'date.max': 'Check-out time cannot be in the future'
        }),
        location: locationSchema.optional(),
        method: Joi.string().valid('manual', 'qr_code', 'gps', 'biometric', 'face_verification').default('manual'),
        deviceInfo: deviceInfoSchema.optional(),
        faceVerificationData: faceVerificationSchema.optional()
    }).optional(),
    breaks: Joi.array().items(breakSchema).default([]).messages({
        'array.base': 'Breaks must be an array'
    }),
    status: Joi.string().valid('present', 'absent', 'late', 'half_day', 'remote', 'on_leave').default('present').messages({
        'any.only': 'Status must be one of: present, absent, late, half_day, remote, on_leave'
    }),
    overtime: overtimeSchema.optional(),
    remoteWork: remoteWorkSchema.optional(),
    notes: Joi.string().trim().max(1000).allow('').messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    })
});

const attendanceUpdateSchema = Joi.object({
    checkIn: Joi.object({
        time: Joi.date().max('now').messages({
            'date.base': 'Check-in time must be a valid date',
            'date.max': 'Check-in time cannot be in the future'
        }),
        location: locationSchema.optional(),
        method: Joi.string().valid('manual', 'qr_code', 'gps', 'biometric', 'face_verification'),
        deviceInfo: deviceInfoSchema.optional(),
        faceVerificationData: faceVerificationSchema.optional()
    }).optional(),
    checkOut: Joi.object({
        time: Joi.date().max('now').messages({
            'date.base': 'Check-out time must be a valid date',
            'date.max': 'Check-out time cannot be in the future'
        }),
        location: locationSchema.optional(),
        method: Joi.string().valid('manual', 'qr_code', 'gps', 'biometric', 'face_verification'),
        deviceInfo: deviceInfoSchema.optional(),
        faceVerificationData: faceVerificationSchema.optional()
    }).optional(),
    breaks: Joi.array().items(breakSchema).messages({
        'array.base': 'Breaks must be an array'
    }),
    status: Joi.string().valid('present', 'absent', 'late', 'half_day', 'remote', 'on_leave').messages({
        'any.only': 'Status must be one of: present, absent, late, half_day, remote, on_leave'
    }),
    overtime: overtimeSchema.optional(),
    remoteWork: remoteWorkSchema.optional(),
    notes: Joi.string().trim().max(1000).allow('').messages({
        'string.max': 'Notes cannot exceed 1000 characters'
    })
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

const attendanceManagementSchema = Joi.object({
    attendanceId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required().messages({
        'string.pattern.base': 'Invalid attendance ID format',
        'any.required': 'Attendance ID is required'
    }),
    action: Joi.string().valid('approve_overtime', 'reject_overtime', 'update_status', 'add_note', 'admin_set_time').required().messages({
        'any.only': 'Action must be one of: approve_overtime, reject_overtime, update_status, add_note, admin_set_time',
        'any.required': 'Action is required'
    }),
    data: Joi.object({
        status: Joi.string().valid('present', 'absent', 'late', 'half_day', 'remote', 'on_leave').messages({
            'any.only': 'Status must be one of: present, absent, late, half_day, remote, on_leave'
        }),
        note: Joi.string().trim().max(1000).messages({
            'string.max': 'Note cannot exceed 1000 characters'
        }),
        checkInTime: Joi.date().max('now').messages({
            'date.base': 'Check-in time must be a valid date',
            'date.max': 'Check-in time cannot be in the future'
        }),
        checkOutTime: Joi.date().max('now').messages({
            'date.base': 'Check-out time must be a valid date',
            'date.max': 'Check-out time cannot be in the future'
        })
    }).optional()
});

const attendanceQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        'number.base': 'Page must be a number',
        'number.integer': 'Page must be a whole number',
        'number.min': 'Page must be at least 1'
    }),
    limit: Joi.number().integer().min(1).max(1000).default(10).messages({
        'number.base': 'Limit must be a number',
        'number.integer': 'Limit must be a whole number',
        'number.min': 'Limit must be at least 1',
        'number.max': 'Limit cannot exceed 1000'
    }),
    employeeId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).messages({
        'string.pattern.base': 'Invalid employee ID format'
    }),
    startDate: Joi.date().messages({
        'date.base': 'Start date must be a valid date'
    }),
    endDate: Joi.date().min(Joi.ref('startDate')).messages({
        'date.base': 'End date must be a valid date',
        'date.min': 'End date must be after start date'
    }),
    status: Joi.string().valid('present', 'absent', 'late', 'half_day', 'remote', 'on_leave').messages({
        'any.only': 'Status must be one of: present, absent, late, half_day, remote, on_leave'
    }),
    search: Joi.string().trim().max(100).messages({
        'string.max': 'Search term cannot exceed 100 characters'
    }),
    sortBy: Joi.string().valid('date', 'checkIn.time', 'checkOut.time', 'totalHours', 'status', 'createdAt').default('date').messages({
        'any.only': 'Sort by must be one of: date, checkIn.time, checkOut.time, totalHours, status, createdAt'
    }),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc').messages({
        'any.only': 'Sort order must be either asc or desc'
    })
});

module.exports = {
    checkInSchema,
    checkOutSchema,
    breakSchema,
    attendanceCreateSchema,
    attendanceUpdateSchema,
    attendanceManagementSchema,
    attendanceQuerySchema,
    locationSchema,
    deviceInfoSchema,
    overtimeSchema,
    remoteWorkSchema,
    faceVerificationSchema
};
