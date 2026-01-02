"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class DefaultWorkout extends Model {}

  DefaultWorkout.init(
    {
      name: { type: DataTypes.STRING, field: "name" },
      exercises: { type: DataTypes.JSON, field: "exercises" },
      createdAt: { type: DataTypes.DATE, field: "createdat" },
      updatedAt: { type: DataTypes.DATE, field: "updatedat" },
    },
    {
      sequelize,
      modelName: "DefaultWorkout",
      tableName: "default_workouts",
      timestamps: true,
    }
  );

  return DefaultWorkout;
};
