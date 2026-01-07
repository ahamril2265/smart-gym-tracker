const express = require("express");
const router = express.Router();
const { User } = require("../models");
const auth = require("../middleware/auth");

// Get profile
router.get("/profile", auth, async (req, res) => {
  const user = await User.findByPk(req.user.id, {
    attributes: { exclude: ["password"] }
  });

  const fs = require('fs');
  fs.writeFileSync('debug_profile.txt', JSON.stringify(user, null, 2));

  res.json(user);
});

const upload = require('../utils/upload');

// Update profile
router.put("/profile", auth, upload.single('profileImage'), async (req, res) => {
  try {
    const { age, weight, height, goal, experience, dob, address, phone_number } = req.body;
    const updateData = { age, weight, height, goal, experience, dob, address, phone_number };

    if (req.file) {
      // Use relative path so it works in production
      updateData.profile_picture = '/uploads/' + req.file.filename;
    } else if (req.body.profileImage) {
      updateData.profile_picture = req.body.profileImage;
    }

    await User.update(
      updateData,
      { where: { id: req.user.id } }
    );
    res.json({ success: true, profile_picture: updateData.profile_picture, user: updateData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
