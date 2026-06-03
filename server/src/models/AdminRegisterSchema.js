const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
});

//  Fix: Simplified hashing logic to avoid "next" error
AdminSchema.pre('save', async function() {
    if (!this.isModified('password')) return;
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error; // Mongoose automatically handles thrown errors in async hooks
    }
});

module.exports = mongoose.model('Admin', AdminSchema);