const express = require('express');
const router = express.Router();
const { User, MembershipPlan, sequelize } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to check if user is admin
const verifyAdmin = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'No token' });

    jwt.verify(token.split(' ')[1], process.env.JWT_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });

        try {
            const user = await User.findByPk(decoded.id);
            if (!user || user.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied. Admins only.' });
            }
            req.user = user;
            next();
        } catch (e) {
            return res.status(500).json({ error: e.message });
        }
    });
};

/* --- PLANS MANAGEMENT --- */

// Get all plans
router.get('/plans', verifyAdmin, async (req, res) => {
    try {
        const plans = await MembershipPlan.findAll({ order: [['price', 'ASC']] });
        res.json(plans);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create Plan
router.post('/plans', verifyAdmin, async (req, res) => {
    try {
        const { name, price, duration_months, description } = req.body;
        const plan = await MembershipPlan.create({ name, price, duration_months, description });
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Plan
router.put('/plans/:id', verifyAdmin, async (req, res) => {
    try {
        const plan = await MembershipPlan.findByPk(req.params.id);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        await plan.update(req.body);
        res.json(plan);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Plan
router.delete('/plans/:id', verifyAdmin, async (req, res) => {
    try {
        const plan = await MembershipPlan.findByPk(req.params.id);
        if (!plan) return res.status(404).json({ error: "Plan not found" });

        await plan.destroy();
        res.json({ message: "Plan deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 1. Get all users with their trainers
router.get('/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: [
                'id', 'username', 'email', 'role', 'trainerId', 'member_id',
                'membershipType', 'membershipStatus',
                'dob', 'address', 'phone_number', 'weight', 'height',
                'total_amount', 'amount_paid', 'start_date', 'payment_status', 'payment_due_date',
                'trainerStatus'
            ],
            include: [
                { model: User, as: 'trainer', attributes: ['id', 'username'] }
            ],
            order: [['id', 'ASC']]
        });
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Update user role (e.g. promote to trainer)
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'trainer', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.role = role;
        await user.save();

        res.json({ message: `User role updated to ${role}`, user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Assign Trainer to User
router.put('/users/:id/trainer', verifyAdmin, async (req, res) => {
    try {
        const { trainerId } = req.body; // Can be null to unassign
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Enforce: Only 'Personal Training (1 Month)' or similar plans can have trainers
        // We check if the plan string contains "Personal Training" or we check against plan attributes if loaded.
        // Or simpler: Check if membership type is 'Personal Training (1 Month)' (exact match from seeder)
        // Given dynamic texts, checking keyword "Personal Training" is robust.
        // OR better, checking membership_type

        if (trainerId && user.membershipType !== 'Personal Training (1 Month)' && !user.membershipType?.includes('Personal Training')) {
            return res.status(400).json({ error: 'Only clients with "Personal Training" plan can be assigned a trainer.' });
        }

        // Verify trainer exists and is actually a trainer
        if (trainerId) {
            const trainer = await User.findByPk(trainerId);
            if (!trainer || trainer.role !== 'trainer') {
                return res.status(400).json({ error: 'Invalid trainer ID' });
            }
        }

        user.trainerId = trainerId;
        await user.save();

        res.json({ message: 'Trainer assigned successfully', user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Get Dashboard Stats
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const totalTrainers = await User.count({ where: { role: 'trainer' } });
        const onDutyTrainers = await User.count({ where: { role: 'trainer', trainer_status: 'on_duty' } });
        const offDutyTrainers = await User.count({ where: { role: 'trainer', trainer_status: 'off_duty' } });

        const totalUsers = await User.count({ where: { role: 'user' } });
        const activeUsers = await User.count({ where: { role: 'user', membership_status: 'active' } });
        const expiredUsers = await User.count({ where: { role: 'user', membership_status: 'expired' } });

        const monthlyPlan = await User.count({ where: { role: 'user', membership_type: 'monthly' } });
        const yearlyPlan = await User.count({ where: { role: 'user', membership_type: 'yearly' } });
        // We can add others later if detailed stats needed

        res.json({
            trainers: { total: totalTrainers, onDuty: onDutyTrainers, offDuty: offDutyTrainers },
            users: { total: totalUsers, active: activeUsers, expired: expiredUsers },
            membership: { monthly: monthlyPlan, yearly: yearlyPlan }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Create User (Invite Flow)
router.post('/users', verifyAdmin, async (req, res) => {
    try {
        const {
            username, email, role, total_amount, amount_paid, start_date,
            dob, address, phone_number, weight, height, membership_type
        } = req.body;

        if (!username || !email) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const { v4: uuidv4 } = require('uuid');
        const { sendActivationEmail } = require('../services/emailService');
        const { generateMemberId } = require('../utils/idGenerator');

        // Generate ID and Token
        const activation_token = uuidv4();
        const member_id = await generateMemberId(role || 'user');

        // Calculate Payment Status
        let payment_status = 'paid';
        let payment_due_date = null;
        const total = parseFloat(total_amount) || 0;
        const paid = parseFloat(amount_paid) || 0;

        if (total > 0 && paid < total) {
            payment_status = 'partial';
            // Default 7 days if partial
            const d = new Date();
            d.setDate(d.getDate() + 7);
            payment_due_date = d;
        }

        // Calculate Membership Status using generic logic
        let membershipStatus = 'active';
        const sDate = start_date ? new Date(start_date) : new Date();
        const now = new Date();
        let durationDays = 0;

        // Fetch plan duration if possible, or fallback manually
        if (role === 'user' && membership_type) {
            const plan = await MembershipPlan.findOne({ where: { name: membership_type } });
            // Try exact match or fallback
            if (plan) {
                durationDays = plan.duration_months * 30; // Approx
            } else {
                // Fallback legacy logic
                switch (membership_type) {
                    case 'one_day': durationDays = 1; break;
                    case 'monthly': durationDays = 30; break;
                    case 'tri_monthly': durationDays = 90; break;
                    case 'half_yearly': durationDays = 180; break;
                    case 'yearly': durationDays = 365; break;
                    default: durationDays = 30;
                }
            }

            if (durationDays > 0) {
                const expiryDate = new Date(sDate);
                expiryDate.setDate(expiryDate.getDate() + durationDays);
                if (now > expiryDate) {
                    membershipStatus = 'expired';
                }
            }
        }

        const newUser = await User.create({
            username,
            email,
            role: role || 'user',
            membershipStatus, // Auto-calculated
            membershipType: membership_type,
            trainerStatus: role === 'trainer' ? 'off_duty' : undefined, // Default off_duty per requirements? Or user choice.
            activation_token,
            member_id,
            total_amount: total,
            amount_paid: paid,
            payment_status,
            payment_due_date,
            activation_expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            dob, address, phone_number, weight, height
        });

        // Send Activation Email instead of Welcome (password) email
        sendActivationEmail(newUser, activation_token).catch(err => console.error("Email failed:", err));

        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 6. Update User (Generic)
router.put('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        const { username, email, goal, membership_type, membership_status } = req.body;

        if (username) user.username = username;
        if (email) user.email = email;

        if (membership_type) user.membershipType = membership_type;
        // if (membership_status) user.membershipStatus = membership_status; // Disabled manual update

        // Update payment info if provided
        if (req.body.total_amount !== undefined) user.total_amount = parseFloat(req.body.total_amount);
        if (req.body.amount_paid !== undefined) user.amount_paid = parseFloat(req.body.amount_paid);
        if (req.body.payment_due_date !== undefined) user.payment_due_date = req.body.payment_due_date ? new Date(req.body.payment_due_date) : null;
        if (req.body.start_date !== undefined) user.start_date = req.body.start_date;

        // New fields
        if (req.body.dob !== undefined) user.dob = req.body.dob;
        if (req.body.address !== undefined) user.address = req.body.address;
        if (req.body.phone_number !== undefined) user.phone_number = req.body.phone_number;
        if (req.body.weight !== undefined) user.weight = req.body.weight;
        if (req.body.height !== undefined) user.height = req.body.height;

        // Auto-calc Membership Status based on (new or existing) start_date & Type
        const mType = user.membershipType || 'one_day';
        const sDate = user.start_date ? new Date(user.start_date) : new Date();
        const now = new Date();
        let durationDays = 0;
        switch (mType) {
            case 'one_day': durationDays = 1; break;
            case 'monthly': durationDays = 30; break;
            case 'tri_monthly': durationDays = 90; break;
            case 'half_yearly': durationDays = 180; break;
            case 'yearly': durationDays = 365; break;
            default: durationDays = 30;
        }
        const expiryDate = new Date(sDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);
        user.membershipStatus = (now > expiryDate) ? 'expired' : 'active';

        // Auto-calc status if amounts change
        if (user.total_amount > 0) {
            if (user.amount_paid >= user.total_amount) {
                user.payment_status = 'paid';
                user.payment_due_date = null; // Clear due date if paid
            } else {
                user.payment_status = 'partial';
                // If no date set but partial, default to 7 days from now if not already set? 
                // Better to let frontend or specific logic handle default dates.
            }
        } else {
            // No total amount means n/a or paid? use explicit logic.
        }

        await user.save();
        res.json({ message: "User updated", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 9. CHECK PAYMENTS & NOTIFY ADMIN
router.post('/check-payments', verifyAdmin, async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const { sendPaymentReminderToAdmin } = require('../services/emailService');

        // Find users with partial payment AND due date is passed or today
        const overdueUsers = await User.findAll({
            where: {
                payment_status: 'partial',
                payment_due_date: {
                    [Op.lte]: new Date() // Less than or equal to now
                }
            }
        });

        if (overdueUsers.length === 0) {
            return res.json({ message: "No overdue payments found." });
        }

        // Notify Admin (req.user is the admin triggering this, or send to a configured admin email)
        // For now, send to the admin who triggered it
        const adminEmail = req.user.email;
        let sentCount = 0;

        // Group them or send one by one? sending one summary might be better but let's do one by one for simplicity as per request "notify admin... to collect"
        // Actually, a summary is better for the admin. But the request said "notify the admin... for reminder to collect".
        // Let's send a summary email.

        await sendPaymentReminderToAdmin(adminEmail, overdueUsers);

        res.json({ message: `Found ${overdueUsers.length} overdue payments. Notification sent to ${adminEmail}.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// 7. Delete User
router.delete('/users/:id', verifyAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(404).json({ error: "User not found" });

        await user.destroy();
        res.json({ message: "User deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 8. Trigger Membership Expiry Emails
router.post('/notify-expiry', verifyAdmin, async (req, res) => {
    try {
        const { sendExpiryReminder } = require('../services/emailService');
        // Find users with expired or expiring status
        const expiredUsers = await User.findAll({
            where: { membershipStatus: 'expired' }
        });

        let sentCount = 0;
        for (const user of expiredUsers) {
            await sendExpiryReminder(user).catch(console.error);
            sentCount++;
        }

        res.json({ message: `Expiry notifications sent to ${sentCount} users.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
