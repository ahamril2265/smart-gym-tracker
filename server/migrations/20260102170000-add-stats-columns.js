'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'trainer_status', {
            type: Sequelize.ENUM('on_duty', 'off_duty'),
            defaultValue: 'on_duty'
        });

        await queryInterface.addColumn('users', 'membership_type', {
            type: Sequelize.ENUM('basic', 'premium', 'vip'),
            defaultValue: 'basic'
        });

        await queryInterface.addColumn('users', 'membership_status', {
            type: Sequelize.ENUM('active', 'expired'),
            defaultValue: 'active' // Default everyone to active for now
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'membership_status');
        await queryInterface.removeColumn('users', 'membership_type');
        await queryInterface.removeColumn('users', 'trainer_status');
        // Note: Removing ENUM types usually requires raw SQL in postgres, skipping for simplicity in dev
    }
};
