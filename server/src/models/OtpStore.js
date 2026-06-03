const mongoose = require('mongoose');

const OtpStoreSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600  // 10 minutes TTL - MongoDB automatically delete karega
    }
});

module.exports = mongoose.model('OtpStore', OtpStoreSchema);
