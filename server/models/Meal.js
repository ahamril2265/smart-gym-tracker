"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Meal extends Model {
    static associate(models) {
      Meal.belongsTo(models.User, { foreignKey: "userId", as: "user" });
    }
  }

  Meal.init(
    {
      userId: { type: DataTypes.INTEGER, allowNull: false, field: "userid" },
      mealType: { type: DataTypes.STRING, allowNull: false },
      food: { type: DataTypes.STRING, allowNull: false },
      calories: { type: DataTypes.FLOAT, allowNull: false },
      protein: { type: DataTypes.FLOAT, defaultValue: 0 },
      carbs: { type: DataTypes.FLOAT, defaultValue: 0 },
      fat: { type: DataTypes.FLOAT, defaultValue: 0 },
      date: { type: DataTypes.DATEONLY, allowNull: false },
      createdAt: { type: DataTypes.DATE, field: "createdat" },
      updatedAt: { type: DataTypes.DATE, field: "updatedat" },
    },
    {
      sequelize,
      modelName: "Meal",
      tableName: "meals",
      timestamps: true,
    }
  );

  return Meal;
};
