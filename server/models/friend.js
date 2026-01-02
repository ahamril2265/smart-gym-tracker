"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Friend extends Model {
    static associate(models) {
      Friend.belongsTo(models.User, {
        foreignKey: "userid",
        as: "user"
      });
      Friend.belongsTo(models.User, {
        foreignKey: "friendid",
        as: "friend"
      });
    }
  }

  Friend.init(
    {
      userid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      friendid: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "createdat"   // 👈 map to DB column
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updatedat"   // 👈 map to DB column
      }
    },
    {
      sequelize,
      modelName: "Friend",
      tableName: "friends",   // ensure correct table
      timestamps: true        // Sequelize will expect createdAt/updatedAt
    }
  );

  return Friend;
};
