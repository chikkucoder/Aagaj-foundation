const mongoose = require('mongoose');

const HealthCardSchema = new mongoose.Schema({
    healthId: { type: String, required: true, unique: true }, // MC-XXXXXX
    fullName: { type: String, required: true },
    mobile: { type: String, required: true, unique: true},
    aadhar: { type: String, required: true, unique: true},
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    address: {
        village: String,
        panchayat: String,
        block: String,
        district: String,
        state: String,
        pincode: String
    },
    photoPath: { type: String },
    paymentId: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: Number, default: 201 },
    paymentStatus: { type: String, default: 'Pending' },
    expiryDate: { type: Date, required: true },
    registeredBy: { type: String, default: 'Self' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('HealthCard', HealthCardSchema);