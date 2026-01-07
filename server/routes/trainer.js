const express = require('express');
const router = express.Router();
const { User, UserProgram, Program, Attendance, sequelize } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to check if user is trainer
const verifyTrainer = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        try {
            const user = await User.findByPk(decoded.id);
            if (!user || user.role !== 'trainer') {
                // Admins can also act as trainers usually, but for strict separation let's keep it trainer only or allow admin too.
                // Let's allow admin to access trainer routes too for debugging/coverage
                if (user.role !== 'admin') {
                    return res.status(403).json({ error: 'Access denied. Trainers only.' });
                }
            }
            req.user = user;
            next();
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    });
};

// 1. Get My Clients
router.get('/clients', verifyTrainer, async (req, res) => {
    try {
        const clients = await User.findAll({
            where: { trainerId: req.user.id },
            attributes: [
                'id', 'username', 'email',
                'membershipType', 'membershipStatus',
                'start_date', 'member_id',
                'payment_status', 'payment_due_date',
                'amount_paid', 'total_amount'
            ],
            include: [
                // Could include their current program
            ]
        });
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1.5 Get Specific Client's Assigned Programs
router.get('/client-programs/:userId', verifyTrainer, async (req, res) => {
    try {
        const { userId } = req.params;
        // Verify client belongs to trainer
        const client = await User.findByPk(userId);
        if (!client) return res.status(404).json({ error: "Client not found" });
        if (req.user.role !== 'admin' && client.trainerId !== req.user.id) {
            return res.status(403).json({ error: "Not your client" });
        }

        const userPrograms = await UserProgram.findAll({ where: { user_id: userId } });

        // Populate program details
        const programs = await Promise.all(userPrograms.map(async (up) => {
            const program = await Program.findByPk(up.program_id);
            if (program) {
                program.dataValues.schedule = up.schedule_days || [];
                program.dataValues.assigned_date = up.assigned_date;
                return program;
            }
            return null;
        }));

        res.json(programs.filter(p => p !== null));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Assign Program to Client
// 2. Assign Program to Client (Multi-Program Support)
router.post('/assign-program', verifyTrainer, async (req, res) => {
    const { userId, programId, days } = req.body; // days: ["Mon", "Wed"] etc.
    try {
        // Verify client
        const client = await User.findByPk(userId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        // Check permission
        if (req.user.role !== 'admin' && client.trainerId !== req.user.id) {
            return res.status(403).json({ error: 'Not your client' });
        }

        // Find existing assignment for this program or create new
        const [assignment, created] = await UserProgram.findOrCreate({
            where: { user_id: userId, program_id: programId },
            defaults: {
                assigned_by: req.user.id,
                schedule_days: days || []
            }
        });

        if (!created) {
            // Update days if already assigned
            assignment.schedule_days = days || [];
            await assignment.save();
        }

        res.json({ message: 'Program assigned/updated successfully', assignment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2.5 Unassign Specific Program
router.post('/unassign-program', verifyTrainer, async (req, res) => {
    const { userId, programId } = req.body;
    try {
        await UserProgram.destroy({
            where: { user_id: userId, program_id: programId }
        });
        res.json({ message: "Program removed" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// 3. Create Client (Invited by Trainer)
router.post('/clients', verifyTrainer, async (req, res) => {
    try {
        const { username, email, start_date } = req.body; // No password input
        if (!username || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { v4: uuidv4 } = require('uuid');
        const { sendActivationEmail } = require('../services/emailService');
        const { generateMemberId } = require('../utils/idGenerator');

        const activation_token = uuidv4();
        const member_id = await generateMemberId('client'); // Clients are always 'client' role

        const newClient = await User.create({
            username,
            email,
            role: 'client',
            trainerId: req.user.id, // Assign to self
            membershipType: 'basic',
            membershipStatus: 'active',
            activation_token,
            member_id,
            start_date: start_date || new Date()
        });

        // Send Activation Email
        sendActivationEmail(newClient, activation_token).catch(console.error);

        res.status(201).json(newClient);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Unassign Client
router.delete('/clients/:id', verifyTrainer, async (req, res) => {
    try {
        const client = await User.findByPk(req.params.id);
        if (!client) return res.status(404).json({ error: "Client not found" });

        // Ensure this client belongs to the trainer
        if (client.trainerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: "Not your client" });
        }

        // Just unassign, don't delete account
        client.trainerId = null;
        await client.save();

        res.json({ message: "Client unassigned successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Check-In (CRM Style)
router.post('/check-in', verifyTrainer, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Find or create attendance for today
        const [attendance, created] = await Attendance.findOrCreate({
            where: {
                user_id: req.user.id,
                date: today
            },
            defaults: {
                check_in_time: new Date(),
                check_out_time: null
            }
        });

        // Update user status
        const user = await User.findByPk(req.user.id);
        user.trainerStatus = 'on_duty';
        await user.save();

        res.json({ message: "Checked In", attendance, status: 'on_duty' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Check-Out (CRM Style)
router.post('/check-out', verifyTrainer, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        // Find today's attendance
        const attendance = await Attendance.findOne({
            where: {
                user_id: req.user.id,
                date: today
            }
        });

        if (attendance) {
            attendance.check_out_time = new Date();
            await attendance.save();
        }

        // Update user status
        const user = await User.findByPk(req.user.id);
        user.trainerStatus = 'off_duty';
        await user.save();

        res.json({ message: "Checked Out", attendance, status: 'off_duty' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 7. Get Today's Attendance
router.get('/attendance/today', verifyTrainer, async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const attendance = await Attendance.findOne({
            where: { user_id: req.user.id, date: today }
        });
        res.json(attendance); // null if not checked in yet
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
