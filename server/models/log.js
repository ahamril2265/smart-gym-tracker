"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Log extends Model {
    static associate(models) {
      Log.belongsTo(models.Workout, { foreignKey: "workoutId", as: "workout" });
    }
  }

  Log.init(
    {
      workoutId: { type: DataTypes.INTEGER, field: "workoutid" },
      exercise: { type: DataTypes.STRING, field: "exercise" },
      reps: { type: DataTypes.INTEGER, field: "reps" },
      sets: { type: DataTypes.INTEGER, field: "sets" },
      weight: { type: DataTypes.FLOAT, field: "weight" },
      createdAt: { type: DataTypes.DATE, field: "createdat" },
      updatedAt: { type: DataTypes.DATE, field: "updatedat" },
    },
    {
      sequelize,
      modelName: "Log",
      tableName: "logs",
      timestamps: true,
    }
  );

  return Log;
};
