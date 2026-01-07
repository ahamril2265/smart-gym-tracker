'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const passwordHash = await bcrypt.hash('admin123', 10);
        const now = new Date();

        // 1. Create Admin
        const adminEmail = 'admin@smartgym.com';
        let admin = await queryInterface.rawSelect('users', { where: { email: adminEmail } }, ['id']);

        if (!admin) {
            await queryInterface.bulkInsert('users', [{
                username: 'SuperAdmin',
                email: adminEmail,
                password: passwordHash,
                role: 'admin',
                member_id: 'ADMIN-001',
                membership_status: 'active',
                membership_type: 'basic',
                amount_paid: 0,
                total_amount: 0,
                createdat: now,
                updatedat: now
            }]);
            console.log('seeded admin: admin@smartgym.com');
        }

        // 2. Create Trainers
        const trainers = [
            { name: 'Trainer Mike', email: 'mike@smartgym.com' },
            { name: 'Trainer Sarah', email: 'sarah@smartgym.com' }
        ];

        for (const t of trainers) {
            const hash = await bcrypt.hash('trainer123', 10);
            let exists = await queryInterface.rawSelect('users', {
                where: {
                    [Sequelize.Op.or]: [
                        { email: t.email },
                        { username: t.name }
                    ]
                }
            }, ['id']);
            if (!exists) {
                await queryInterface.bulkInsert('users', [{
                    username: t.name,
                    email: t.email,
                    password: hash,
                    role: 'trainer',
                    member_id: 'TR-' + Math.floor(Math.random() * 1000),
                    membership_status: 'active',
                    membership_type: 'vip',
                    trainer_status: 'on_duty',
                    amount_paid: 0,
                    total_amount: 0,
                    createdat: now,
                    updatedat: now
                }]);
            }
        }

        // Get Trainer IDs
        const mikeId = await queryInterface.rawSelect('users', { where: { email: 'mike@smartgym.com' } }, ['id']);
        const sarahId = await queryInterface.rawSelect('users', { where: { email: 'sarah@smartgym.com' } }, ['id']);

        // 3. Create Clients
        const clients = [
            { name: 'Alice Client', email: 'alice@client.com', trainer: mikeId, mid: 'MEM-001' },
            { name: 'Bob Client', email: 'bob@client.com', trainer: mikeId, mid: 'MEM-002' },
            { name: 'Charlie Client', email: 'charlie@client.com', trainer: sarahId, mid: 'MEM-003' }
        ];

        for (const c of clients) {
            const hash = await bcrypt.hash('client123', 10);
            let exists = await queryInterface.rawSelect('users', {
                where: {
                    [Sequelize.Op.or]: [
                        { email: c.email },
                        { username: c.name }
                    ]
                }
            }, ['id']);
            if (!exists) {
                await queryInterface.bulkInsert('users', [{
                    username: c.name,
                    email: c.email,
                    password: hash,
                    role: 'user',
                    member_id: c.mid,
                    trainerId: c.trainer,
                    membership_status: 'active',
                    membership_type: c.trainer ? 'premium' : 'basic',
                    amount_paid: 5000,
                    total_amount: 9000,
                    createdat: now,
                    updatedat: now
                }]);
            }
        }

        console.log('Unified Demo Data Seeded Successfully');
    },

    async down(queryInterface, Sequelize) {
        // No-op for safety in production
    }
};
