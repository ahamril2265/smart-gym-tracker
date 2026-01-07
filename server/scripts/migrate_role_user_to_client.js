require('dotenv').config({ path: __dirname + '/../.env' });
const { User, sequelize } = require('../models');

async function migrateRoles() {
    try {
        await sequelize.authenticate();
        console.log('Connected to DB.');

        const [results, metadata] = await sequelize.query(
            "UPDATE users SET role = 'client' WHERE role = 'user'"
        );

        console.log(`Migrated users to clients. Metadata:`, metadata);
        // Postgres returns metadata differently, but usually rowCount or similar is in there.
        // For generic SQL update, logging result is enough.

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await sequelize.close();
    }
}

migrateRoles();
