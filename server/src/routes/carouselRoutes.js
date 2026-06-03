const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const CarouselImage = require('../models/CarouselImageSchema');
const cloudinary = require('../config/cloudinary');

// Middleware to verify admin session
const verifyAdmin = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ success: false, message: "Access Denied. No Token Provided." });

    const tokenVal = token.replace("Bearer ", "");
    if (tokenVal === 'employee-session') {
        req.user = { role: 'employee' };
        return res.status(403).json({ success: false, message: "Access Denied. Admins Only." });
    }

    try {
        const verified = jwt.verify(tokenVal, process.env.JWT_SECRET);
        req.user = verified;
        if (verified.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access Denied. Admins Only." });
        }
        next();
    } catch (err) {
        res.status(400).json({ success: false, message: "Invalid Token" });
    }
};

// 1. GET /api/carousel - Public: Fetch active carousel images
router.get('/', async (req, res) => {
    try {
        const images = await CarouselImage.find({ active: true }).sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: images });
    } catch (error) {
        console.error("Fetch Active Carousel Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 2. GET /api/carousel/all - Admin Only: Fetch all carousel images (active & inactive)
router.get('/all', verifyAdmin, async (req, res) => {
    try {
        const images = await CarouselImage.find().sort({ order: 1, createdAt: -1 });
        res.json({ success: true, data: images });
    } catch (error) {
        console.error("Fetch All Carousel Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 3. POST /api/carousel - Admin Only: Create new carousel image entry
router.post('/', verifyAdmin, async (req, res) => {
    try {
        const { imageUrl, publicId, title, order, active } = req.body;

        if (!imageUrl || !publicId) {
            return res.status(400).json({ success: false, message: "imageUrl and publicId are required." });
        }

        const newImage = new CarouselImage({
            imageUrl,
            publicId,
            title: title || '',
            order: order !== undefined ? Number(order) : 0,
            active: active !== undefined ? active : true
        });

        await newImage.save();
        res.json({ success: true, message: "Carousel image saved successfully!", data: newImage });
    } catch (error) {
        console.error("Save Carousel Image Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 4. PUT /api/carousel/:id - Admin Only: Update carousel image details
router.put('/:id', verifyAdmin, async (req, res) => {
    try {
        const { title, order, active } = req.body;
        const updateData = {};
        
        if (title !== undefined) updateData.title = title;
        if (order !== undefined) updateData.order = Number(order);
        if (active !== undefined) updateData.active = active;

        const updatedImage = await CarouselImage.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({ success: false, message: "Carousel image not found." });
        }

        res.json({ success: true, message: "Carousel image updated successfully!", data: updatedImage });
    } catch (error) {
        console.error("Update Carousel Image Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

// 5. DELETE /api/carousel/:id - Admin Only: Delete from DB & Cloudinary
router.delete('/:id', verifyAdmin, async (req, res) => {
    try {
        const image = await CarouselImage.findById(req.params.id);
        if (!image) {
            return res.status(404).json({ success: false, message: "Carousel image not found." });
        }

        // Delete from Cloudinary
        if (image.publicId) {
            try {
                await cloudinary.uploader.destroy(image.publicId);
            } catch (clErr) {
                console.error("Cloudinary Delete Error:", clErr);
                // Continue to delete from DB even if Cloudinary delete fails (e.g. if already deleted manually)
            }
        }

        // Delete from database
        await CarouselImage.findByIdAndDelete(req.params.id);

        res.json({ success: true, message: "Carousel image deleted successfully!" });
    } catch (error) {
        console.error("Delete Carousel Image Error:", error);
        res.status(500).json({ success: false, message: "Server Error: " + error.message });
    }
});

module.exports = router;
