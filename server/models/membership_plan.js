"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    class MembershipPlan extends Model {
        static associate(models) {
            // Define associations here if any (e.g., User belongsTo Plan)
        }
    }

    MembershipPlan.init(
        {
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            price: {
                type: DataTypes.FLOAT,
                allowNull: false
            },
            duration_months: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            },
            is_active: {
                type: DataTypes.BOOLEAN,
                defaultValue: true
            }
        },
        {
            sequelize,
            modelName: "MembershipPlan",
            tableName: "MembershipPlans",
        }
    );

    return MembershipPlan;
};
