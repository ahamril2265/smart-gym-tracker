'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Programs Table
        await queryInterface.createTable('programs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            difficulty: {
                type: Sequelize.STRING // 'beginner', 'intermediate', 'advanced'
            },
            description: {
                type: Sequelize.TEXT
            },
            created_by: {
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' },
                onDelete: 'SET NULL'
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

        // 2. Program Exercises Table
        await queryInterface.createTable('program_exercises', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            program_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'programs', key: 'id' },
                onDelete: 'CASCADE'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            sets: {
                type: Sequelize.INTEGER,
                defaultValue: 3
            },
            reps: {
                type: Sequelize.INTEGER,
                defaultValue: 10
            },
            position: {
                type: Sequelize.INTEGER,
                defaultValue: 0
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

        // 3. User Programs (Assignment) Table
        await queryInterface.createTable('user_programs', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'users', key: 'id' },
                onDelete: 'CASCADE'
            },
            program_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: { model: 'programs', key: 'id' },
                onDelete: 'CASCADE'
            },
            assigned_by: {
                type: Sequelize.INTEGER,
                references: { model: 'users', key: 'id' }
            },
            assigned_date: {
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
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
        await queryInterface.dropTable('user_programs');
        await queryInterface.dropTable('program_exercises');
        await queryInterface.dropTable('programs');
    }
};
