const nodemailer = require('nodemailer');

// Create test account for development (Ethereal)
// In production, replace with real SMTP (Gmail, AWS SES, etc.)
let transporter;

async function init() {
    // Check if we have env vars, otherwise create test account
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        // Use Gmail if specified or default to generic SMTP if HOST is different
        // But user asked for GMAIL specifically.
        const config = {
            service: process.env.SMTP_SERVICE || 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        };

        // If not gmail service, we might need host/port
        if (process.env.SMTP_HOST) {
            delete config.service;
            config.host = process.env.SMTP_HOST;
            config.port = process.env.SMTP_PORT || 587;
            config.secure = false;
        }

        transporter = nodemailer.createTransport(config);

        try {
            await transporter.verify();
            console.log(`Email Service Connected & Verified with ${config.service || config.host}`);
        } catch (error) {
            console.error('Email Service Connection Failed:', error);
            // We don't throw here to avoid crashing the server, but logs will show the issue
        }
    } else {
        const testAccount = await nodemailer.createTestAccount();
        console.log('Ethereal Email Test Account:', testAccount.user);

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
}

init().catch(console.error);

async function sendWelcomeEmail(user, password) {
    if (!transporter) await init();

    const info = await transporter.sendMail({
        from: '"Smart Gym Tracker" <no-reply@smartgym.com>',
        to: user.email,
        subject: "Welcome to Smart Gym!",
        text: `Hello ${user.username},\n\nWelcome to Smart Gym! Your account has been created.\n\nLogin Credentials:\nEmail: ${user.email}\nPassword: ${password}\n\nPlease change your password after logging in.\n\nBest,\nSmart Gym Team`,
        html: `<b>Hello ${user.username},</b><br><br>Welcome to Smart Gym! Your account has been created.<br><br><b>Login Credentials:</b><br>Email: ${user.email}<br>Password: ${password}<br><br>Please change your password after logging in.<br><br>Best,<br>Smart Gym Team`
    });

    console.log("Welcome Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
}

async function sendActivationEmail(user, token) {
    if (!transporter) await init();

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const link = `${clientUrl}/activate?token=${token}`;

    const info = await transporter.sendMail({
        from: '"Smart Gym Tracker" <no-reply@smartgym.com>',
        to: user.email,
        subject: "Activate Your Smart Gym Account",
        text: `Hello ${user.username},\n\nPlease click the link below to activate your account and set your password:\n\n${link}\n\nYour Member ID is: ${user.member_id}\n\nBest,\nSmart Gym Team`,
        html: `<b>Hello ${user.username},</b><br><br>Please click the link below to activate your account and set your password:<br><br><a href="${link}">Activate Account</a><br><br><p>Your Member ID is: <b>${user.member_id}</b></p><br><br>Best,<br>Smart Gym Team`
    });

    console.log("Activation Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
}

async function sendExpiryReminder(user) {
    if (!transporter) await init();

    const info = await transporter.sendMail({
        from: '"Smart Gym Tracker" <no-reply@smartgym.com>',
        to: user.email,
        subject: "Membership Expiring Soon!",
        text: `Hello ${user.username},\n\nYour gym membership is expiring soon. Please renew to keep accessing our facilities.\n\nBest,\nSmart Gym Team`,
        html: `<b>Hello ${user.username},</b><br><br>Your gym membership is expiring soon. Please renew to keep accessing our facilities.<br><br>Best,<br>Smart Gym Team`
    });

    console.log("Expiry Email sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
}

// Notify Admin about overdue payments
const sendPaymentReminderToAdmin = async (adminEmail, overdueUsers) => {
    if (!transporter) await init(); // Ensure transporter is initialized

    const listHtml = overdueUsers.map(u => `
        <li>
            <b>${u.username} (${u.member_id})</b><br/>
            Paid: $${u.amount_paid} / Total: $${u.total_amount}<br/>
            Due Date: ${new Date(u.payment_due_date).toLocaleDateString()}
        </li>
    `).join('');

    const mailOptions = {
        from: process.env.SMTP_USER,
        to: adminEmail,
        subject: `🔔 Action Required: ${overdueUsers.length} Overdue Payments`,
        html: `
            <h2>Overdue Payment Reminders</h2>
            <p>The following clients have passed their payment due date:</p>
            <ul>${listHtml}</ul>
            <p>Please follow up with them.</p>
        `
    };
    const info = await transporter.sendMail(mailOptions);
    console.log("Payment Reminder to Admin sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    return info;
};

module.exports = {
    sendWelcomeEmail,
    sendActivationEmail,
    sendExpiryReminder,
    sendPaymentReminderToAdmin
};
