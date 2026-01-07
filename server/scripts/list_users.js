require('dotenv').config({ path: __dirname + '/../.env' });
const { User, sequelize } = require('../models');

async function listUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'member_id']
        });

        console.table(users.map(u => u.toJSON()));

    } catch (e) {
        console.error("Error:", e);
    } finally {
        await sequelize.close();
    }
}

listUsers();
