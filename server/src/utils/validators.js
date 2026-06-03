const Joi = require('joi');

// ============================================
// VALIDATION SCHEMAS
// ============================================

// Schema for Silayi Registration
const silayiSchema = Joi.object({
    name: Joi.string().min(2).max(100).required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.pattern.base': 'Name can only contain letters and spaces',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters',
            'any.required': 'Name is required'
        }),
    
    mobileNumber: Joi.string().pattern(/^[6-9]\d{9}$/).required()
        .messages({
            'string.pattern.base': 'Invalid mobile number. Must be 10 digits starting with 6-9',
            'any.required': 'Mobile number is required'
        }),
    
    aadharNumber: Joi.string().pattern(/^\d{12}$/).required()
        .messages({
            'string.pattern.base': 'Aadhar must be exactly 12 digits',
            'any.required': 'Aadhar number is required'
        }),
    
    email: Joi.string().email().optional().allow(''),
    
    age: Joi.number().integer().min(18).max(100).required()
        .messages({
            'number.min': 'Age must be at least 18',
            'number.max': 'Age cannot exceed 100',
            'any.required': 'Age is required'
        }),
    
    guardianName: Joi.string().min(2).max(100).required()
        .messages({
            'string.min': 'Guardian name must be at least 2 characters',
            'string.max': 'Guardian name cannot exceed 100 characters'
        }),
    
    address: Joi.string().min(5).max(500).required()
        .messages({
            'string.min': 'Address must be at least 5 characters',
            'string.max': 'Address cannot exceed 500 characters'
        }),
    
    trainingDate: Joi.string().optional(),
    caste: Joi.string().optional(),
    trainingName: Joi.string().optional(),
    existingSkills: Joi.string().optional(),
    trainingDuration: Joi.string().optional()
});

// Schema for Swarojgaar Registration
const swarojgaarSchema = Joi.object({
    groupName: Joi.string().min(2).max(100).required()
        .messages({
            'string.min': 'Group name must be at least 2 characters',
            'any.required': 'Group name is required'
        }),
    
    village: Joi.string().min(2).max(100).optional(),
    panchayat: Joi.string().min(2).max(100).optional(),
    block: Joi.string().min(2).max(100).optional(),
    district: Joi.string().min(2).max(100).optional(),
    state: Joi.string().min(2).max(100).optional(),
    
    memberCount: Joi.number().integer().min(1).optional(),
    groupEmail: Joi.string().email().optional().allow(''),
    groupPhone: Joi.string().pattern(/^[6-9]\d{9}$/).optional().allow('')
});

// Schema for Health Card Registration
const healthCardSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required()
        .messages({
            'string.min': 'Full name must be at least 2 characters',
            'any.required': 'Full name is required'
        }),
    
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    aadhar: Joi.string().pattern(/^\d{12}$/).required(),
    age: Joi.number().integer().min(1).max(120).required(),
    gender: Joi.string().valid('Male', 'Female', 'Other').required(),
    bloodGroup: Joi.string().valid('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-').optional(),
    
    village: Joi.string().min(2).max(100).optional(),
    panchayat: Joi.string().min(2).max(100).optional(),
    block: Joi.string().min(2).max(100).optional(),
    district: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    pincode: Joi.string().pattern(/^\d{6}$/).optional()
});

// Schema for Job Application
const jobApplicationSchema = Joi.object({
    full_name: Joi.string().min(2).max(100).required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.pattern.base': 'Name can only contain letters and spaces'
        }),
    
    email: Joi.string().email().required(),
    mobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    aadhar: Joi.string().pattern(/^\d{12}$/).required(),
    dob: Joi.string().required(),
    
    district: Joi.string().min(2).max(100).required(),
    state: Joi.string().min(2).max(100).required(),
    
    role_applied: Joi.string().min(2).max(100).required(),
    qualifications: Joi.string().min(2).max(500).optional(),
    amount: Joi.number().required()
});

// Schema for Admin/Employee Login
const loginSchema = Joi.object({
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),
    
    username: Joi.string().min(3).max(50).optional(),
    password: Joi.string().min(6).required()
        .messages({
            'string.min': 'Password must be at least 6 characters',
            'any.required': 'Password is required'
        })
});

// Schema for Admin Registration
const adminRegistrationSchema = Joi.object({
    fullName: Joi.string().min(2).max(100).required()
        .pattern(/^[a-zA-Z\s]+$/)
        .messages({
            'string.pattern.base': 'Name can only contain letters and spaces'
        }),
    
    email: Joi.string().email().required()
        .messages({
            'string.email': 'Please provide a valid email address'
        }),
    
    password: Joi.string().min(8).max(50)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+/)
        .required()
        .messages({
            'string.pattern.base': 'Password must contain uppercase, lowercase, number and special character (@$!%*?&)',
            'string.min': 'Password must be at least 8 characters',
            'any.required': 'Password is required'
        })
});

// Schema for Appointment
const appointmentSchema = Joi.object({
    beneficiaryName: Joi.string().min(2).max(100).required(),
    beneficiaryMobile: Joi.string().pattern(/^[6-9]\d{9}$/).required(),
    appointmentDate: Joi.string().required(),
    appointmentTime: Joi.string().required(),
    partnerId: Joi.string().required()
});

// ============================================
// VALIDATION MIDDLEWARE
// ============================================

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { 
            abortEarly: false,
            stripUnknown: true  // Remove unknown fields
        });
        
        if (error) {
            const errors = error.details.map(detail => detail.message);
            return res.status(400).json({ 
                success: false, 
                message: 'Validation Error',
                errors: errors 
            });
        }
        next();
    };
};

// ============================================
// EXPORTS
// ============================================

module.exports = { 
    silayiSchema,
    swarojgaarSchema,
    healthCardSchema,
    jobApplicationSchema,
    loginSchema,
    adminRegistrationSchema,
    appointmentSchema,
    validate 
};
