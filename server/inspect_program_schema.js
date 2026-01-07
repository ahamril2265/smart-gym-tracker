const db = require('./models');

async function inspect() {
    try {
        await db.sequelize.authenticate();
        console.log('Connected to DB.');

        try {
            const table = await db.sequelize.getQueryInterface().describeTable('user_programs');
            console.log('Table schema:', JSON.stringify(table, null, 2));
        } catch (e) {
            console.error('Table user_programs does not exist or error describing:', e.message);
        }

    } catch (e) {
        console.error('Connection failed:', e);
    } finally {
        await db.sequelize.close();
    }
}

inspect();
