const { Joi } = require('../middleware/requestValidation');

const hospitalLoginSchema = Joi.object({
    identifier: Joi.string().trim().min(3).optional(),
    email: Joi.string().trim().email().optional(),
    password: Joi.string().min(6).required()
}).or('identifier', 'email');

const generateCredentialsSchema = Joi.object({
    uniqueId: Joi.string().trim().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    loginId: Joi.string().trim().optional()
});

const registerHospitalSchema = Joi.object({
    biz: Joi.string().trim().min(2).max(150).required(),
    hashPass: Joi.string().min(6).required(),
    license: Joi.string().trim().min(3).max(80).required(),
    city: Joi.string().trim().min(2).max(80).required(),
    state: Joi.string().trim().min(2).max(80).required(),
    pin: Joi.string().pattern(/^\d{6}$/).required(),
    owner: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    email: Joi.string().email().required(),
    specialization: Joi.alternatives().try(
        Joi.string().trim().min(2).max(100),
        Joi.array().items(Joi.string().trim().min(2).max(100))
    ).optional()
});

const editHospitalSchema = Joi.object({
    biz: Joi.string().trim().min(2).max(150).required(),
    license: Joi.string().trim().min(3).max(80).required(),
    city: Joi.string().trim().min(2).max(80).required(),
    state: Joi.string().trim().min(2).max(80).required(),
    pin: Joi.string().pattern(/^\d{6}$/).required(),
    owner: Joi.string().trim().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    email: Joi.string().email().required(),
    specialization: Joi.alternatives().try(
        Joi.string().trim().min(2).max(100),
        Joi.array().items(Joi.string().trim().min(2).max(100))
    ).optional()
});

const hospitalIdQuerySchema = Joi.object({
    hospitalId: Joi.string().trim().required()
});

const addBillSchema = Joi.object({
    hospitalId: Joi.string().trim().required(),
    healthId: Joi.string().trim().allow('', null).optional(),
    patientName: Joi.string().trim().min(2).max(100).required(),
    patientMobile: Joi.string().pattern(/^\d{10}$/).required(),
    treatmentDetails: Joi.string().trim().min(2).max(1000).required(),
    billAmount: Joi.number().positive().required(),
    status: Joi.string().valid('Paid', 'Unpaid').required(),
    billPhoto: Joi.string().allow('', null).optional()
});

const appointmentBookSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    gender: Joi.string().trim().allow('', null).optional(),
    age: Joi.alternatives().try(Joi.number().integer().min(0), Joi.string().trim().allow('')).optional(),
    aadhar: Joi.string().pattern(/^\d{12}$/).required(),
    phone: Joi.string().pattern(/^\d{10}$/).required(),
    bloodGroup: Joi.string().trim().allow('', null).optional(),
    healthId: Joi.string().trim().min(6).max(20).required(),
    street: Joi.string().trim().allow('', null).optional(),
    city: Joi.string().trim().allow('', null).optional(),
    pin: Joi.string().pattern(/^\d{6}$/).allow('', null).optional(),
    department: Joi.string().trim().allow('', null).optional(),
    doctor: Joi.string().trim().allow('', null).optional(),
    date: Joi.string().trim().required(),
    message: Joi.string().trim().allow('', null).optional(),
    appointmentType: Joi.string().valid('physical_visit', 'teleconsultation').default('physical_visit').required(),
    hospitalId: Joi.string().trim().required()
});

const testNotifySchema = Joi.object({
    phone: Joi.string().pattern(/^\d{10,15}$/).required(),
    message: Joi.string().trim().max(500).optional(),
    sendSms: Joi.boolean().optional(),
    sendWhatsapp: Joi.boolean().optional()
});

const healthCardCheckExistsSchema = Joi.object({
    mobile: Joi.string().pattern(/^\d{10}$/).optional(),
    aadhar: Joi.string().pattern(/^\d{12}$/).optional()
}).or('mobile', 'aadhar');

const healthCardCreateOrderSchema = Joi.object({
    fullName: Joi.string().trim().min(2).max(100).required(),
    mobile: Joi.string().pattern(/^\d{10}$/).required(),
    aadhar: Joi.string().pattern(/^\d{12}$/).required(),
    age: Joi.alternatives().try(Joi.number().integer().min(1).max(120), Joi.string().trim()).required(),
    gender: Joi.string().trim().required(),
    bloodGroup: Joi.string().trim().allow('', null).optional(),
    village: Joi.string().trim().allow('', null).optional(),
    panchayat: Joi.string().trim().allow('', null).optional(),
    block: Joi.string().trim().allow('', null).optional(),
    district: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    pincode: Joi.string().pattern(/^\d{6}$/).allow('', null).optional(),
    registeredBy: Joi.string().trim().allow('', null).optional()
});

const healthCardVerifyPaymentSchema = Joi.object({
    razorpay_order_id: Joi.string().trim().required(),
    razorpay_payment_id: Joi.string().trim().required(),
    razorpay_signature: Joi.string().trim().required(),
    pendingOrderId: Joi.string().trim().required()
});

const paymentVerifySchema = Joi.object({
    razorpay_order_id: Joi.string().trim().required(),
    razorpay_payment_id: Joi.string().trim().required(),
    razorpay_signature: Joi.string().trim().required(),
    pendingOrderId: Joi.string().trim().required()
});

const jobApplicationCreateOrderSchema = Joi.object({
    full_name: Joi.string().trim().min(2).max(100).required(),
    email: Joi.string().trim().email().required(),
    mobile: Joi.string().pattern(/^\d{10}$/).required(),
    aadhar: Joi.string().pattern(/^\d{12}$/).required(),
    dob: Joi.string().trim().required(),
    district: Joi.string().trim().required(),
    state: Joi.string().trim().required(),
    block: Joi.string().trim().allow('', null).optional(),
    panchayat: Joi.string().trim().allow('', null).optional(),
    place: Joi.string().trim().allow('', null).optional(),
    apply_for_post: Joi.string().trim().required(),
    role_applied: Joi.string().trim().required(),
    qualifications: Joi.string().trim().allow('', null).optional(),
    amount: Joi.alternatives().try(Joi.number(), Joi.string()).required(),
    job_category: Joi.string().valid('Normal', 'NGO').optional(),
    registeredBy: Joi.string().trim().allow('', null).optional()
});

const swarojgaarCreateOrderSchema = Joi.object({
    groupName: Joi.string().trim().min(2).max(100).required(),
    village: Joi.string().trim().required(),
    panchayat: Joi.string().trim().required(),
    anumandal: Joi.string().trim().required(),
    district: Joi.string().trim().required(),
    registrationFee: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    members: Joi.string().required(),
    registeredBy: Joi.string().trim().allow('', null).optional()
});

const swarojgaarRegisterSchema = Joi.object({
    groupName: Joi.string().trim().min(2).max(100).required(),
    village: Joi.string().trim().required(),
    panchayat: Joi.string().trim().required(),
    anumandal: Joi.string().trim().required(),
    district: Joi.string().trim().required(),
    registrationFee: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    members: Joi.string().required(),
    registeredBy: Joi.string().trim().allow('', null).optional(),
    paymentId: Joi.string().trim().allow('', null).optional(),
    paymentStatus: Joi.string().trim().allow('', null).optional(),
    orderId: Joi.string().trim().allow('', null).optional()
});

const silayiCreateOrderSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    mobileNumber: Joi.string().pattern(/^\d{10}$/).required(),
    aadharNumber: Joi.string().pattern(/^\d{12}$/).required(),
    email: Joi.string().trim().email().allow('', null).optional(),
    age: Joi.alternatives().try(Joi.number().integer().min(1).max(120), Joi.string().trim()).required(),
    guardianName: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(5).max(500).required(),
    gender: Joi.string().trim().allow('', null).optional(),
    caste: Joi.string().trim().allow('', null).optional(),
    trainingName: Joi.string().trim().allow('', null).optional(),
    existingSkills: Joi.string().trim().allow('', null).optional(),
    trainingDuration: Joi.string().trim().allow('', null).optional(),
    trainingDate: Joi.string().trim().allow('', null).optional(),
    registeredBy: Joi.string().trim().allow('', null).optional(),
    serialNumber: Joi.string().trim().allow('', null).optional()
});

const silayiRegisterSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    mobileNumber: Joi.string().pattern(/^\d{10}$/).required(),
    aadharNumber: Joi.string().pattern(/^\d{12}$/).required(),
    email: Joi.string().trim().email().allow('', null).optional(),
    age: Joi.alternatives().try(Joi.number().integer().min(1).max(120), Joi.string().trim()).required(),
    guardianName: Joi.string().trim().min(2).max(100).required(),
    address: Joi.string().trim().min(5).max(500).required(),
    gender: Joi.string().trim().allow('', null).optional(),
    caste: Joi.string().trim().allow('', null).optional(),
    trainingName: Joi.string().trim().allow('', null).optional(),
    existingSkills: Joi.string().trim().allow('', null).optional(),
    trainingDuration: Joi.string().trim().allow('', null).optional(),
    trainingDate: Joi.string().trim().allow('', null).optional(),
    registeredBy: Joi.string().trim().allow('', null).optional(),
    serialNumber: Joi.string().trim().allow('', null).optional(),
    yojanaName: Joi.string().trim().allow('', null).optional(),
    paymentStatus: Joi.string().trim().allow('', null).optional(),
    registrationFee: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    orderId: Joi.string().trim().allow('', null).optional(),
    paymentId: Joi.string().trim().allow('', null).optional()
});

const createDonationOrderSchema = Joi.object({
    amount: Joi.number().positive().required(),
    donorData: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().email().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        address: Joi.string().trim().min(5).max(300).required(),
        pan: Joi.string().trim().allow('', null).optional(),
        state: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        pincode: Joi.string().pattern(/^\d{6}$/).required()
    }).required()
});

const verifyDonationSchema = Joi.object({
    razorpay_order_id: Joi.string().trim().required(),
    razorpay_payment_id: Joi.string().trim().required(),
    razorpay_signature: Joi.string().trim().required(),
    amount: Joi.number().required(),
    donorData: Joi.object({
        name: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().email().required(),
        phone: Joi.string().pattern(/^\d{10}$/).required(),
        address: Joi.string().trim().min(5).max(300).required(),
        pan: Joi.string().trim().allow('', null).optional(),
        state: Joi.string().trim().required(),
        city: Joi.string().trim().required(),
        pincode: Joi.string().pattern(/^\d{6}$/).required()
    }).required()
});

module.exports = {
    hospitalLoginSchema,
    generateCredentialsSchema,
    registerHospitalSchema,
    editHospitalSchema,
    hospitalIdQuerySchema,
    addBillSchema,
    appointmentBookSchema,
    testNotifySchema,
    healthCardCheckExistsSchema,
    healthCardCreateOrderSchema,
    healthCardVerifyPaymentSchema,
    paymentVerifySchema,
    jobApplicationCreateOrderSchema,
    swarojgaarCreateOrderSchema,
    swarojgaarRegisterSchema,
    silayiCreateOrderSchema,
    silayiRegisterSchema,
    createDonationOrderSchema,
    verifyDonationSchema
};
