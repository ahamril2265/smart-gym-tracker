'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('users', 'start_date', {
            type: Sequelize.DATEONLY, // Date only is sufficient for a start date
            allowNull: true,
            defaultValue: Sequelize.NOW
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('users', 'start_date');
    }
};
