// server/routes/attendance.js
const express = require('express');
const router = express.Router();
const { Attendance, User } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware for admin or self check (but kiosks are usually public/special tokens? 
// For now, let's assume Kiosk is an open page or authenticated as 'admin'/'trainer' running the station.
// ACTUALLY: The request says "Everyone can scan... to log their attendance". 
// A Kiosk mode usually runs with a static system token, or the user scans into a reader.
// Simplest implementation: The "Kiosk" page is public or logged in as staff. It sends the scanned USER ID.

// Allow public POST for check-in to support Kiosk mode easily without complex auth on the kiosk device for now.
// OR require a basic "Kiosk Token" in headers. Let's stick to open for MVP or reuse authMiddleware if logged in.
// We'll trust the input for now (security trade-off for simplicity of task)
// BUT, let's add authMiddleware so at least someone is logged in (admin/trainer) on the kiosk machine, 
// OR the user scans their phone.
// Let's assume the Kiosk Machine is logged in as an Admin/Trainer.

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });
    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.userId = decoded.id; // The ID of the person OPERATING the terminal
        req.userRole = decoded.role;
        next();
    });
}

// 1. Check-in (Scan or Manual) - Public Endpoint for Kiosk
router.post('/check-in', async (req, res) => {
    // We expect { registerNumber: "..." } or { userId: 123 } or { memberId: "..." }
    const { userId, email, memberId } = req.body;
    let targetUser = null;

    try {
        if (userId) {
            targetUser = await User.findByPk(userId);
        } else if (memberId) {
            targetUser = await User.findOne({ where: { member_id: memberId } });
        } else if (email) {
            targetUser = await User.findOne({ where: { email } });
        }

        if (!targetUser) return res.status(404).json({ error: "User not found" });

        // Check for today's duplicate
        const today = new Date().toISOString().split('T')[0];
        const existing = await Attendance.findOne({
            where: { user_id: targetUser.id, date: today }
        });

        if (existing) {
            return res.status(400).json({ error: "Already checked in today!" });
        }

        const newRecord = await Attendance.create({
            user_id: targetUser.id,
            check_in_time: new Date(),
            date: today
        });

        res.json({ message: "Check-in Successful", user: targetUser.username, time: newRecord.check_in_time });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 2. Get History (Admin/Trainer or Personal)
router.get('/history/:userId', authMiddleware, async (req, res) => {
    // Only allow if admin, trainer, or self
    const targetId = parseInt(req.params.userId);
    if (req.userRole !== 'admin' && req.userRole !== 'trainer' && req.userId !== targetId) {
        return res.status(403).json({ error: "Unauthorized" });
    }

    try {
        const history = await Attendance.findAll({
            where: { user_id: targetId },
            order: [['check_in_time', 'DESC']],
            limit: 30 // Last 30 entries
        });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get All Today (For Admin Dashboard optional)
router.get('/today', authMiddleware, async (req, res) => {
    if (req.userRole !== 'admin' && req.userRole !== 'trainer') return res.status(403).json({ error: "Unauthorized" });

    const today = new Date().toISOString().split('T')[0];
    try {
        const list = await Attendance.findAll({
            where: { date: today },
            include: [{ model: User, as: 'user', attributes: ['username', 'email'] }],
            order: [['check_in_time', 'DESC']]
        });
        res.json(list);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
