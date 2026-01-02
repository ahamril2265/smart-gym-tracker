const express = require('express');
const router = express.Router();
const { User } = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Activate Account (Set Password)
router.post('/activate', async (req, res) => {
    const { token, password } = req.body;
    try {
        const user = await User.findOne({ where: { activation_token: token } });
        if (!user) return res.status(400).json({ error: "Invalid activation token" });

        // Check for expiry
        if (user.activation_expires && new Date() > new Date(user.activation_expires)) {
            return res.status(400).json({ error: "Activation link has expired. Please contact support." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password_hash = hashedPassword;
        user.activation_token = null; // Clear token
        await user.save();

        res.json({ message: "Account activated successfully. You can now login." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
