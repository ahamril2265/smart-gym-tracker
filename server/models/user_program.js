"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class UserProgram extends Model { }

    UserProgram.init(
        {
            user_id: { type: DataTypes.INTEGER, allowNull: false },
            program_id: { type: DataTypes.INTEGER, allowNull: false },
            assigned_by: DataTypes.INTEGER,
            assigned_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
            createdAt: { type: DataTypes.DATE, field: "createdat" },
            updatedAt: { type: DataTypes.DATE, field: "updatedat" },
        },
        {
            sequelize,
            modelName: "UserProgram",
            tableName: "user_programs",
            timestamps: true,
        }
    );

    return UserProgram;
};
