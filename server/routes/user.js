const express = require("express");
const router = express.Router();
const { User } = require("../models");
const auth = require("../middleware/auth");

// Get profile
router.get("/profile", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] }
  });
  res.json(user);
});

const upload = require('../utils/upload');

// Update profile
router.put("/profile", auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { age, weight, height, goal, experience } = req.body;
    const updateData = { age, weight, height, goal, experience };

    if (req.file) {
      // Normalize path for Windows? standardize to forward slashes for URL
      updateData.profile_picture = 'http://localhost:5001/uploads/' + req.file.filename;
      // Note: In production, use relative paths or S3 URLs. Localhost is fine for now.
      // Or better, just store relative path '/uploads/filename' and prepend domain on frontend? 
      // The previous code used full URL in 'profileImage' field so let's stick to full URL for simplicity or relative if standard.
      // The current field name in DB is 'profile_picture'.
    } else if (req.body.profileImage) {
      // Allow manual URL update if they didn't upload a file (legacy support)
      updateData.profile_picture = req.body.profileImage;
    }

    await User.update(
      updateData,
      { where: { id: req.user.id } }
    );
    res.json({ success: true, profile_picture: updateData.profile_picture });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
