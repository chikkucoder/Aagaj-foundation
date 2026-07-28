const mongoose = require('mongoose');

const HealthCardOtpSchema = new mongoose.Schema({
    healthId: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    mobile: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        trim: true
    },
    reqId: {
        type: String,
        trim: true
    },
    otpHash: {
        type: String
    },
    attempts: {
        type: Number,
        default: 0
    },
    maxAttempts: {
        type: Number,
        default: 5
    },
    resendAvailableAt: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: 0 } // Automatic MongoDB TTL deletion when expired
    }
}, { timestamps: true });

module.exports = mongoose.model('HealthCardOtp', HealthCardOtpSchema);
