const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

// POST /api/upload — Single image upload to Cloudinary
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    res.status(200).json({
      success: true,
      imageUrl: req.file.path,       // Cloudinary URL
      publicId: req.file.filename,   // Useful for future delete
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;