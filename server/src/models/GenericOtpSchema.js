const mongoose = require('mongoose');

const GenericOtpSchema = new mongoose.Schema({
    identifier: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    scope: {
        type: String,
        required: true,
        enum: ['healthcard', 'appointment', 'silayi', 'membership', 'hospital_checkin', 'swarojgaar'],
        index: true
    },
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    reqId: {
        type: String,
        trim: true
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
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('GenericOtp', GenericOtpSchema);
