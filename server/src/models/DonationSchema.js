// ============================================
// ✅ UPDATED: DONATION SCHEMA (Optimized for Getepay)
// ============================================
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    // Payment Gateway Identifiers
    payment_id: { 
        type: String, 
        required: true, 
        unique: true 
    },
    order_id: { 
        type: String, 
        required: true 
    },
    
    // Financial Data
    amount: { 
        type: Number, 
        required: true 
    },
    currency: { 
        type: String, 
        default: "INR" 
    },
    
    // Donor Personal Details (Captured via UDFs)
    donor_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    phone: { 
        type: String, 
        required: true 
    },
    
    // Optional Details
    address: { 
        type: String 
    },
    state: { 
        type: String 
    },
    city: {type: String},
    pincode: {type: String},
    pan: { 
        type: String 
    },
    
    // Metadata
    status: { 
        type: String, 
        default: "Pending" 
    },
    date: { 
        type: Date, 
        default: Date.now 
    },
    
    // Gateway Specific Response (Good for debugging)
    gateway_response: { 
        type: Object 
    }
});

// Export the model for use in your routes
module.exports = mongoose.model('Donation', donationSchema);