'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        const plans = [
            {
                name: 'Monthly',
                price: 2000,
                duration_months: 1,
                description: 'Standard Monthly Pass',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: '6 Months + 1 Month Free',
                price: 5000,
                duration_months: 7, // 6 + 1
                description: 'Half-yearly Special',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: '10 Months + 2 Months Free',
                price: 10000,
                duration_months: 12, // 10 + 2
                description: 'Yearly Lite',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: '12 Months + 3 Months Free',
                price: 14000,
                duration_months: 15, // 12 + 3
                description: 'Yearly Premium',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'Personal Training (1 Month)',
                price: 9000,
                duration_months: 1,
                description: 'Private Coaching',
                is_active: true,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];

        // Check if plans exist to avoid duplicates
        for (const plan of plans) {
            const exists = await queryInterface.rawSelect('MembershipPlans', {
                where: { name: plan.name }
            }, ['id']);

            if (!exists) {
                await queryInterface.bulkInsert('MembershipPlans', [plan]);
            } else {
                // Optional: Update price if exists? For now, skip.
            }
        }
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('MembershipPlans', null, {});
    }
};
