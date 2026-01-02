const { sequelize, User } = require('../models');
const bcrypt = require('bcrypt');

async function resetDatabase() {
    try {
        console.log('🔄 Syncing database (force: true)...');
        // This drops all tables and recreates them based on models
        await sequelize.sync({ force: true });
        console.log('✅ Database tables recreated.');

        console.log('👤 Creating default Admin user...');

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await User.create({
            username: 'Admin',
            email: 'admin@smartgym.com',
            password_hash: hashedPassword, // Using password_hash based on previous knowledge
            role: 'admin',
            member_id: 'A0001',
            membershipType: 'vip',
            membershipStatus: 'active',
            activation_token: null // Already active
        });

        console.log('✅ Admin user created:');
        console.log('   Email: admin@smartgym.com');
        console.log('   Password: admin123');
        console.log('   Member ID: A0001');

        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to reset database:', error);
        process.exit(1);
    }
}

resetDatabase();
