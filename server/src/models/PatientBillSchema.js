const mongoose = require('mongoose');

const PatientBillSchema = new mongoose.Schema({
    billId: {
        type: String,
        unique: true,
        required: true
    },
    hospitalId: {
        type: String, // uniqueId from HealthPartner
        required: true
    },
    healthId: {
        type: String, // Patient's Unique Health Card ID
        default: 'General'
    },
    patientName: {
        type: String,
        required: true
    },
    patientMobile: {
        type: String,
        required: true
    },
    treatmentDetails: {
        type: String,
        required: true
    },
    billAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['Paid', 'Unpaid'],
        default: 'Unpaid'
    },
    date: {
        type: Date,
        default: Date.now
    },
    billPhoto: {
        type: String // Base64 or URL (primary image for backwards compatibility)
    },
    billPhotos: [{
        type: String // Array of Base64 or URLs for multiple receipts
    }]
});

module.exports = mongoose.model('PatientBill', PatientBillSchema);
