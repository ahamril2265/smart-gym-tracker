"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class Program extends Model {
        static associate(models) {
            Program.hasMany(models.ProgramExercise, { foreignKey: "program_id", as: "exercises" });
            Program.belongsTo(models.User, { foreignKey: "created_by", as: "creator" });
        }
    }

    Program.init(
        {
            name: { type: DataTypes.STRING, allowNull: false },
            difficulty: DataTypes.STRING,
            description: DataTypes.TEXT,
            created_by: DataTypes.INTEGER,
            createdAt: { type: DataTypes.DATE, field: "createdat" },
            updatedAt: { type: DataTypes.DATE, field: "updatedat" },
        },
        {
            sequelize,
            modelName: "Program",
            tableName: "programs",
            timestamps: true,
        }
    );

    return Program;
};
