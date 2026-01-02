"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Workout extends Model {
    static associate(models) {
      Workout.belongsTo(models.User, { foreignKey: "userId", as: "user" });
      Workout.hasMany(models.Log, { foreignKey: "workoutId", as: "logs" });
    }
  }

  Workout.init(
    {
      userId: { type: DataTypes.INTEGER, field: "userid" },
      name: { type: DataTypes.STRING, field: "name" },
      date: { type: DataTypes.DATE, field: "date" },
      createdAt: { type: DataTypes.DATE, field: "createdat" },
      updatedAt: { type: DataTypes.DATE, field: "updatedat" },
    },
    {
      sequelize,
      modelName: "Workout",
      tableName: "workouts",
      timestamps: true,
    }
  );

  return Workout;
};
