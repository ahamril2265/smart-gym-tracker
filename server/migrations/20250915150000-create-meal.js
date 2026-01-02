'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('meals', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            userid: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onDelete: 'CASCADE'
            },
            mealType: {
                type: Sequelize.STRING,
                allowNull: false
            },
            food: {
                type: Sequelize.STRING,
                allowNull: false
            },
            calories: {
                type: Sequelize.FLOAT,
                allowNull: false
            },
            protein: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            carbs: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            fat: {
                type: Sequelize.FLOAT,
                defaultValue: 0
            },
            date: {
                type: Sequelize.DATEONLY,
                allowNull: false
            },
            createdat: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedat: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('meals');
    }
};
