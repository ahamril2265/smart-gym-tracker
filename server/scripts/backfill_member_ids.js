require('dotenv').config({ path: __dirname + '/../.env' });
const { User, sequelize } = require('../models');
const { generateMemberId } = require('../utils/idGenerator');

async function backfill() {
    try {
        await sequelize.authenticate();
        console.log('Connected.');

        const { Op } = require('sequelize');
        const usersWithoutId = await User.findAll({
            where: {
                [Op.or]: [
                    { member_id: null },
                    { member_id: '' }
                ]
            }
        });

        console.log(`Found ${usersWithoutId.length} users without member_id.`);

        for (const user of usersWithoutId) {
            const newId = await generateMemberId(user.role || 'user');
            user.member_id = newId;
            await user.save();
            console.log(`Updated user ${user.id} (${user.username}) with ID: ${newId}`);
        }

        console.log('Backfill complete.');
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await sequelize.close();
    }
}

backfill();
