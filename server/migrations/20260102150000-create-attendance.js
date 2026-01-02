'use strict';
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('attendances', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            check_in_time: {
                type: Sequelize.DATE,
                allowNull: false
            },
            date: {
                type: Sequelize.DATEONLY, // Store just the date for easy duplicate checking per day
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
        await queryInterface.dropTable('attendances');
    }
};
