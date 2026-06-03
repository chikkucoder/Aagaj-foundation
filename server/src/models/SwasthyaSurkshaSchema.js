const mongoose = require('mongoose');

const healthPartnerSchema = new mongoose.Schema({
    uniqueId: {
        type: String,
        unique: true // हर पार्टनर की आईडी अलग होगी
    },
    category: {
        type: String,
        required: true,
        enum: ['Hospital', 'Lab', 'Pharmacy'] // केवल यही 3 वैल्यू आ सकती हैं
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    experience: {
        type: String, // Years of experience
        default: ''
    },
    // ✅ Specific Fields based on Category
    nablStatus: { type: String, trim: true },        // For Lab
    drugLicenseExpiry: { type: String, trim: true }, // For Pharmacy
    numberOfBeds: { type: String, trim: true },      // For Hospital
    specialization: { type: [String], default: ['General Medicine'] }, // Hospital specialization type

    licenseNumber: {
        type: String,
        required: true,
        unique: true // एक लाइसेंस नंबर दोबारा रजिस्टर नहीं होगा
    },
    address: {
        fullAddress: { type: String, required: true },
        landmark: { type: String },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true }
    },
    contact: {
        ownerName: { type: String, required: true },
        whatsappNumber: { type: String, required: true }
    },
    services: [String], // Array of strings e.g. ["ICU", "OPD"]
    
    registrationDate: {
        type: Date,
        default: Date.now
    },

    // ✅ New Field: To track which employee registered this partner
    registeredBy: {
        type: String,
        default: 'Admin/Self'
    },
    // ✅ Authentication Fields
    email: { 
        type: String, 
        unique: true, 
        sparse: true, 
        trim: true, 
        lowercase: true 
    },
    loginId: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true
    },
    password: { 
        type: String 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
});

module.exports = mongoose.model('HealthPartner', healthPartnerSchema);