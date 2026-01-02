'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.addColumn('users', 'activation_token', {
            type: Sequelize.STRING,
            allowNull: true
        });
        await queryInterface.addColumn('users', 'member_id', {
            type: Sequelize.STRING,
            allowNull: true,
            unique: true
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.removeColumn('users', 'activation_token');
        await queryInterface.removeColumn('users', 'member_id');
    }
};
