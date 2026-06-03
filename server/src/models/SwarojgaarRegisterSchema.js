const mongoose = require('mongoose');

// 1. (Member Sub-schema)
const memberSchema = new mongoose.Schema({
    fullName: {
        type: String,
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    aadharCard: {
        type: String,
        trim: true
    },
    panCard: {
        type: String,
        trim: true
    },
    mobileNumber: {
        type: String,
        trim: true
    },
    photoUrl: {
        type: String,
        default: "" // फोटो का पाथ
    }
});

// 2. मुख्य स्कीमा (Main Group Schema)
const swarojgaarGroupSchema = new mongoose.Schema({
    // स्थान विवरण
    location: {
        village: { type: String, trim: true },
        panchayat: { type: String, trim: true },
        subDivision: { type: String, trim: true },
        district: { type: String, trim: true }
    },

    // समूह विवरण
    groupName: {
        type: String,
        required: true,
        unique: true, // डुप्लीकेट नाम नहीं चलेगा
        trim: true
    },

    // सदस्यों की सूची
    members: {
        type: [memberSchema],
        default: []
    },

    // नियम और शर्तें
    termsAccepted: {
        type: Boolean,
        default: true
    },

    // आधिकारिक विवरण
    approvalDetails: {
        areaCoordinatorName: { type: String, default: "" },
        isApproved: { type: Boolean, default: false },
        approvedDate: { type: Date }
    },

    // ✅ New Field: To track which employee registered this group
    registeredBy: {
        type: String,
        default: 'Admin/Self'
    },

    // ✅✅✅ PAYMENT FIELDS ADDED ✅✅✅
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid'],
        default: 'Pending'
    },
    paymentId: {
        type: String,
        default: ''
    },
    orderId: {
        type: String,
        default: ''
    },
    registrationFee: {
        type: Number,
        default: 100 // Default 100 Rs as requested
    }

}, { timestamps: true });

module.exports = mongoose.model('SwarojgaarGroup', swarojgaarGroupSchema);
