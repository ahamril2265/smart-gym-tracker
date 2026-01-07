require('dotenv').config();
const { User, MembershipPlan, sequelize } = require('./models');
const { generateMemberId } = require('./utils/idGenerator');
const bcrypt = require('bcrypt');

async function reseed() {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Database connected.');

        // 1. Preserve Admin, delete others
        console.log('Cleaning up old data...');

        // Delete dependent data first
        // Check if models exist in the destructured import or access via sequelize.models
        const { Workout, Meal, Friend, UserProgram, Attendance } = sequelize.models; // Ensure we get all models

        try { if (Attendance) await Attendance.destroy({ where: {} }); } catch (e) { console.log('No Attendance table or empty'); }
        try { if (UserProgram) await UserProgram.destroy({ where: {} }); } catch (e) { console.log('UserProgram cleanup error/skip'); }
        try { if (typeof sequelize.models.Log !== 'undefined') await sequelize.models.Log.destroy({ where: {} }); } catch (e) { }
        try { if (Workout) await Workout.destroy({ where: {} }); } catch (e) { console.log('Workout cleanup error/skip'); }
        try { if (Meal) await Meal.destroy({ where: {} }); } catch (e) { console.log('Meal cleanup error/skip'); }
        try { if (Friend) await Friend.destroy({ where: {} }); } catch (e) { console.log('Friend cleanup error/skip'); }

        // Nullify created_by in Programs to avoid FK constraint with Users
        const { Program } = sequelize.models;
        try {
            if (Program) {
                await Program.update({ created_by: null }, { where: {} });
                console.log('Unlinked Programs from Users.');
            }
        } catch (e) { console.log('Program unlink error/skip', e.message); }

        // Now delete users
        await User.destroy({
            where: {
                role: {
                    [require('sequelize').Op.ne]: 'admin'
                }
            }
        });
        console.log('Cleanup complete.');

        // 2. Fetch Plans
        const plans = await MembershipPlan.findAll();
        if (plans.length === 0) {
            console.error("No membership plans found! Seeding basic plans first...");
            // Optional: seed plans if missing, but assuming they exist from previous steps
            // If empty, let's create simplified ones for demo
            await MembershipPlan.bulkCreate([
                { name: 'Monthly', price: 2000, duration_months: 1, description: 'Standard Monthly' },
                { name: 'Yearly', price: 10000, duration_months: 12, description: 'Best Value' },
                { name: 'Personal Training (1 Month)', price: 9000, duration_months: 1, description: 'Private Coaching' }
            ]);
        }
        const activePlans = await MembershipPlan.findAll();

        const passwordHash = await bcrypt.hash('password123', 10);

        // 3. Create 5 Trainers
        console.log('Creating 5 Trainers...');
        const trainers = [];
        for (let i = 1; i <= 5; i++) {
            const memberId = await generateMemberId('trainer'); // T000X
            const trainer = await User.create({
                username: `Trainer ${i}`,
                email: `trainer${i}@gym.com`,
                password_hash: passwordHash,
                role: 'trainer',
                trainerStatus: i % 2 === 0 ? 'on_duty' : 'off_duty', // Mix status
                member_id: memberId,
                membershipStatus: 'active',
                phone_number: `987654000${i}`,
                address: `Gym Staff Quarters ${i}`
            });
            trainers.push(trainer);
            console.log(`Created ${trainer.username} (${trainer.member_id})`);
        }

        // 4. Create 50 Clients
        console.log('Creating 50 Clients...');

        const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayan', 'Krishna', 'Ishaan'];
        const lastNames = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Bhatia', 'Mehta', 'Joshi', 'Patel', 'Reddy', 'Singh'];

        for (let i = 1; i <= 50; i++) {
            // Random Name
            const fname = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
            const username = `${fname}${lname}${i}`;
            const email = `client${i}@example.com`;

            // Random Plan
            const plan = activePlans[Math.floor(Math.random() * activePlans.length)];

            // Random Stats
            const memberId = await generateMemberId('user'); // C000X
            const startDate = new Date();
            // Random start date within last 3 months to next 1 month
            startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 90) + 30);

            // Calc expiry
            const expiryDate = new Date(startDate);
            expiryDate.setDate(expiryDate.getDate() + (plan.duration_months * 30));

            const isExpired = new Date() > expiryDate;
            const membershipStatus = isExpired ? 'expired' : 'active';

            // Payment logic
            const isPaid = Math.random() > 0.2; // 80% paid
            const amountPaid = isPaid ? plan.price : (Math.random() > 0.5 ? plan.price / 2 : 0);
            const paymentStatus = amountPaid >= plan.price ? 'paid' : 'partial';

            await User.create({
                username: username,
                email: email,
                password_hash: passwordHash,
                role: 'user',
                member_id: memberId,
                membershipType: plan.name,
                membershipStatus: membershipStatus,
                total_amount: plan.price,
                amount_paid: amountPaid,
                payment_status: paymentStatus,
                payment_due_date: paymentStatus === 'partial' ? new Date() : null,
                start_date: startDate,
                dob: `199${Math.floor(Math.random() * 9)}-0${Math.floor(Math.random() * 9) + 1}-15`,
                address: `Sector ${Math.floor(Math.random() * 50)}, City`,
                phone_number: `98765${Math.floor(10000 + Math.random() * 90000)}`,
                weight: 60 + Math.floor(Math.random() * 40),
                height: 160 + Math.floor(Math.random() * 30),
                // Assign trainer if Personal Training
                trainerId: (plan.name.includes('Personal') && trainers.length > 0)
                    ? trainers[Math.floor(Math.random() * trainers.length)].id
                    : null
            });

            if (i % 10 === 0) console.log(`Created ${i} clients...`);
        }

        console.log('Reseed complete.');
        process.exit(0);

    } catch (err) {
        console.error('Reseed failed:', err);
        process.exit(1);
    }
}

reseed();
