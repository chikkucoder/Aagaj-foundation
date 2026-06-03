const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    // Patient Details
    name: { type: String, required: true },
    gender: { type: String },
    age: { type: Number },
    aadhar: { type: String, required: true },
    phone: { type: String, required: true },
    bloodGroup: { type: String },
    healthId: { type: String, required: true },

    // Address Details
    street: { type: String },
    city: { type: String },
    pincode: { type: String },

    // Appointment Details
    department: { type: String },
    doctor: { type: String }, // Facility Name
    hospitalId: { type: String }, // ✅ Unique ID of the HealthPartner
    hospitalName: { type: String },
    date: { type: String, required: true },
    message: { type: String }, // Patient Problem

    // ✅ File Storage (Directly in DB)
    healthCardData: { type: Buffer },       
    healthCardContentType: { type: String }, 
    healthCardFileName: { type: String },   

    status: { type: String, default: 'Pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Appointment', AppointmentSchema);