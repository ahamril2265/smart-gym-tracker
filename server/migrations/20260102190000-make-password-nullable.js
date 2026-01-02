'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: true // Allow null for Invite Flow
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert to non-nullable (careful if nulls exist)
        // We might not adhere perfectly to down migration here if data exists, but for dev it works
        await queryInterface.changeColumn('users', 'password', {
            type: Sequelize.STRING,
            allowNull: false
        });
    }
};
