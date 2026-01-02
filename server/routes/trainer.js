const express = require('express');
const router = express.Router();
const { User, UserProgram, Program, sequelize } = require('../models');
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

// 2. Assign Program to Client
router.post('/assign-program', verifyTrainer, async (req, res) => {
    const { userId, programId } = req.body;
    try {
        // Verify client belongs to this trainer (or is admin)
        const client = await User.findByPk(userId);
        if (!client) return res.status(404).json({ error: 'Client not found' });

        if (req.user.role !== 'admin' && client.trainerId !== req.user.id) {
            return res.status(403).json({ error: 'You can only assign programs to your own clients' });
        }

        // Assign (using previous simple logic: delete old, add new)
        // Note: UserProgram model was created but we can use raw query or model
        // Let's use raw query for consistency with previous 'assign' route or update to model
        // Using Model:
        await UserProgram.destroy({ where: { user_id: userId } });
        await UserProgram.create({
            user_id: userId,
            program_id: programId,
            assigned_by: req.user.id
        });

        res.json({ message: 'Program assigned successfully' });
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
        const member_id = await generateMemberId('user'); // Clients are always 'user' role

        const newClient = await User.create({
            username,
            email,
            role: 'user',
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

module.exports = router;
