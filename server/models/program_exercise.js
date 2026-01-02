"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class ProgramExercise extends Model {
        static associate(models) {
            ProgramExercise.belongsTo(models.Program, { foreignKey: "program_id", as: "program" });
        }
    }

    ProgramExercise.init(
        {
            program_id: { type: DataTypes.INTEGER, allowNull: false },
            name: { type: DataTypes.STRING, allowNull: false },
            sets: { type: DataTypes.INTEGER, defaultValue: 3 },
            reps: { type: DataTypes.INTEGER, defaultValue: 10 },
            position: { type: DataTypes.INTEGER, defaultValue: 0 },
            createdAt: { type: DataTypes.DATE, field: "createdat" },
            updatedAt: { type: DataTypes.DATE, field: "updatedat" },
        },
        {
            sequelize,
            modelName: "ProgramExercise",
            tableName: "program_exercises",
            timestamps: true,
        }
    );

    return ProgramExercise;
};
