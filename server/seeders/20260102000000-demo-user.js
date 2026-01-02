'use strict';
const bcrypt = require('bcrypt');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const passwordHash = await bcrypt.hash('password123', 10);
        const now = new Date();

        // 1. Check if admin exists
        const admin = await queryInterface.rawSelect('users', {
            where: { username: 'admin' },
        }, ['id']);

        if (!admin) {
            await queryInterface.bulkInsert('users', [{
                username: 'admin',
                email: 'admin@gym.com',
                password: passwordHash,
                role: 'admin',
                createdat: now,
                updatedat: now
            }]);
        }

        // 2. Check if user exists
        const user = await queryInterface.rawSelect('users', {
            where: { username: 'john_doe' },
        }, ['id']);

        if (!user) {
            await queryInterface.bulkInsert('users', [{
                username: 'john_doe',
                email: 'john@example.com',
                password: passwordHash,
                role: 'user',
                createdat: now,
                updatedat: now
            }]);
        }
    },

    async down(queryInterface, Sequelize) {
        // No-op to avoid deleting real data in dev
    }
};
