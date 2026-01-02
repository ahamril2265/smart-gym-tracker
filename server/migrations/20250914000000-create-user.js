'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            username: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
                unique: true
            },
            password: { // Maps to password_hash in model if specified, or just password
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.STRING,
                defaultValue: 'user'
            },
            age: {
                type: Sequelize.INTEGER
            },
            weight: {
                type: Sequelize.FLOAT
            },
            height: {
                type: Sequelize.FLOAT
            },
            goal: {
                type: Sequelize.STRING
            },
            experience: {
                type: Sequelize.STRING
            },
            profileImage: {
                type: Sequelize.STRING
            },
            createdat: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedat: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    }
};
