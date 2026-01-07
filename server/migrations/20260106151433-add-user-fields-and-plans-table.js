'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Add columns to Users table
    await queryInterface.addColumn('users', 'dob', {
      type: Sequelize.DATEONLY,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'address', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'phone_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: true
    });
    await queryInterface.addColumn('users', 'height', {
      type: Sequelize.FLOAT,
      allowNull: true
    });

    // 2. Create MembershipPlans table
    await queryInterface.createTable('MembershipPlans', {
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
      price: {
        type: Sequelize.FLOAT,
        allowNull: false
      },
      duration_months: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // 1. Remove columns
    await queryInterface.removeColumn('users', 'dob');
    await queryInterface.removeColumn('users', 'address');
    await queryInterface.removeColumn('users', 'phone_number');
    await queryInterface.removeColumn('users', 'weight');
    await queryInterface.removeColumn('users', 'height');

    // 2. Drop table
    await queryInterface.dropTable('MembershipPlans');
  }
};
