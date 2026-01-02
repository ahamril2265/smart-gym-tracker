'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const now = new Date();

        // 1. Ensure Admin exists
        const admin = await queryInterface.rawSelect('users', {
            where: { email: 'admin@gym.com' },
        }, ['id']);

        if (!admin) {
            await queryInterface.bulkInsert('users', [{
                username: 'Admin',
                email: 'admin@gym.com',
                password: passwordHash,
                role: 'admin',
                createdat: now,
                updatedat: now
            }]);
        }

        // 2. Create Trainers
        const trainersData = [
            { username: 'Trainer Mike', email: 'mike@gym.com', role: 'trainer' },
            { username: 'Trainer Sarah', email: 'sarah@gym.com', role: 'trainer' },
            { username: 'Trainer John', email: 'john_pt@gym.com', role: 'trainer' }
        ];

        for (const t of trainersData) {
            const exists = await queryInterface.rawSelect('users', { where: { email: t.email } }, ['id']);
            if (!exists) {
                await queryInterface.bulkInsert('users', [{
                    username: t.username,
                    email: t.email,
                    password: passwordHash,
                    role: t.role,
                    trainer_status: Math.random() > 0.3 ? 'on_duty' : 'off_duty',
                    createdat: now,
                    updatedat: now
                }]);
            }
        }

        // Fetch trainer IDs
        const trainerMike = await queryInterface.rawSelect('users', { where: { email: 'mike@gym.com' } }, ['id']);
        const trainerSarah = await queryInterface.rawSelect('users', { where: { email: 'sarah@gym.com' } }, ['id']);

        // 3. Create Users (Clients)
        const clientsData = [
            { username: 'Alice', email: 'alice@client.com', trainerId: trainerMike },
            { username: 'Bob', email: 'bob@client.com', trainerId: trainerMike },
            { username: 'Charlie', email: 'charlie@client.com', trainerId: trainerSarah },
            { username: 'David', email: 'david@client.com', trainerId: trainerSarah },
            { username: 'Eve', email: 'eve@client.com', trainerId: null } // Unassigned
        ];

        for (const c of clientsData) {
            const exists = await queryInterface.rawSelect('users', { where: { email: c.email } }, ['id']);
            if (!exists) {
                await queryInterface.bulkInsert('users', [{
                    username: c.username,
                    email: c.email,
                    password: passwordHash,
                    role: 'user',
                    trainerId: c.trainerId,
                    membership_type: ['basic', 'premium', 'vip'][Math.floor(Math.random() * 3)],
                    membership_status: Math.random() > 0.8 ? 'expired' : 'active',
                    createdat: now,
                    updatedat: now
                }]);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        // Ideally we would delete only the users we created, but for dev it's often easier to just truncate or leave them.
        // We'll leave them to avoid accidental data loss of real users in dev.
    }
};
