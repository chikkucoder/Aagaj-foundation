const mongoose = require('mongoose');

const CarouselImageSchema = new mongoose.Schema({
    imageUrl: {
        type: String,
        required: true,
        trim: true
    },
    publicId: {
        type: String,
        required: true,
        trim: true
    },
    title: {
        type: String,
        trim: true,
        default: ''
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('CarouselImage', CarouselImageSchema);
