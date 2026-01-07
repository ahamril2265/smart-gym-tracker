"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Workout, { foreignKey: "userId", as: "workouts" });
      User.hasMany(models.Meal, { foreignKey: "userId", as: "meals" });
      User.hasMany(models.Log, { foreignKey: "workoutId", as: "logs" });
      User.hasMany(models.Friend, { foreignKey: "userid", as: "friends" });

      // Self-referential association for Trainer <-> Clients
      User.belongsTo(models.User, { as: 'trainer', foreignKey: 'trainerId' });
      User.hasMany(models.User, { as: 'clients', foreignKey: 'trainerId' });
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: true,
        field: "password"
      },
      role: {
        type: DataTypes.STRING,
        defaultValue: 'client'
      },
      trainerStatus: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'trainer_status'
      },
      membershipType: {
        type: DataTypes.STRING,
        defaultValue: 'basic',
        field: 'membership_type'
      },
      membershipStatus: {
        type: DataTypes.STRING,
        defaultValue: 'active',
        field: 'membership_status'
      },
      trainerId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      activation_token: {
        type: DataTypes.STRING,
        allowNull: true
      },
      member_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
      },
      activation_expires: {
        type: DataTypes.DATE,
        allowNull: true
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "createdat",
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updatedat",
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: 'paid',
        allowNull: true
      },
      amount_paid: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: true
      },
      total_amount: {
        type: DataTypes.FLOAT,
        defaultValue: 0.0,
        allowNull: true
      },
      payment_due_date: {
        type: DataTypes.DATE,
        allowNull: true
      },
      start_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        defaultValue: DataTypes.NOW
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: true
      },
      address: {
        type: DataTypes.STRING,
        allowNull: true
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true
      },
      weight: {
        type: DataTypes.FLOAT,
        allowNull: true
      },
      height: {
        type: DataTypes.FLOAT,
        allowNull: true
      }
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
