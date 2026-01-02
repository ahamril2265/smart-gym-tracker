'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Attendance extends Model {
        static associate(models) {
            Attendance.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
        }
    }

    Attendance.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        check_in_time: {
            type: DataTypes.DATE,
            allowNull: false
        },
        date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        createdAt: { type: DataTypes.DATE, field: 'createdat' },
        updatedAt: { type: DataTypes.DATE, field: 'updatedat' }
    }, {
        sequelize,
        modelName: 'Attendance',
        tableName: 'attendances',
        timestamps: true
    });

    return Attendance;
};
