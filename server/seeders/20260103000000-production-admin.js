'use strict';
const bcrypt = require('bcrypt');


/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const adminEmail = 'admin@smartgym.com';

        // Check if admin exists
        const existingAdmin = await queryInterface.rawSelect('users', {
            where: { email: adminEmail },
        }, ['id']);

        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const now = new Date();

            // Generate a member_id
            // Since we can't easily import utils here without messy paths, we'll hardcode or generate a simple one
            const member_id = 'ADMIN-' + Math.floor(1000 + Math.random() * 9000);

            await queryInterface.bulkInsert('users', [{
                username: 'SuperAdmin',
                email: adminEmail,
                password: hashedPassword, // Note: Model column might be 'password_hash' or 'password', raw insert needs exact column name
                role: 'admin',
                member_id: member_id,
                membership_status: 'active', // Raw column name
                membership_type: 'basic',   // Raw column name
                activation_token: null,
                trainer_status: 'off_duty',
                amount_paid: 0,
                total_amount: 0,
                payment_status: 'paid',
                createdat: now,
                updatedat: now
            }]);
            console.log('Production Admin Created: admin@smartgym.com / admin123');
        } else {
            console.log('Admin already exists, skipping creation.');
        }
    },

    async down(queryInterface, Sequelize) {
        // We don't want to delete admin blindly in production rollback usually, 
        // but strict down migration would delete it.
        // await queryInterface.bulkDelete('users', { email: 'admin@smartgym.com' });
    }
};
