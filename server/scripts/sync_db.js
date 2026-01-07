const db = require('../models');

async function sync() {
    try {
        await db.sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Sync all models
        await db.sequelize.sync({ alter: true });
        console.log('All models were synchronized successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await db.sequelize.close();
    }
}

sync();
