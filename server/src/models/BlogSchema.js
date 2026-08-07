const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String,
        trim: true,
        default: ''
    },
    category: {
        type: String,
        trim: true,
        default: 'General'
    },
    author: {
        type: String,
        trim: true,
        default: 'Aagaj Foundation'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Blog', BlogSchema);
