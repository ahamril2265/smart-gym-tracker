'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'payment_status', {
            type: Sequelize.STRING,
            defaultValue: 'paid', // Default to paid to strictly assume payments are settled unless specified
            allowNull: true
        });
        await queryInterface.addColumn('users', 'amount_paid', {
            type: Sequelize.FLOAT,
            defaultValue: 0.0,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'total_amount', {
            type: Sequelize.FLOAT,
            defaultValue: 0.0,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'payment_due_date', {
            type: Sequelize.DATE,
            allowNull: true
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'payment_status');
        await queryInterface.removeColumn('users', 'amount_paid');
        await queryInterface.removeColumn('users', 'total_amount');
        await queryInterface.removeColumn('users', 'payment_due_date');
    }
};
