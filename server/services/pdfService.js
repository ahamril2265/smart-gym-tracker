const PDFDocument = require('pdfkit');

/**
 * Generates a PDF buffer for the Welcome Letter / Invoice
 * @param {Object} user - User object (username, email, member_id, etc.)
 * @param {Object} membershipDetails - Calculated details (planName, expiryDate, pendingAmount)
 * @param {Buffer} qrCodeBuffer - Buffer of the QR code image
 * @returns {Promise<Buffer>}
 */
function generateWelcomePDF(user, membershipDetails, qrCodeBuffer) {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            const pdfData = Buffer.concat(buffers);
            resolve(pdfData);
        });

        // --- Header ---
        doc.fontSize(25).font('Helvetica-Bold').text('SMART GYM TRACKER', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).font('Helvetica').text('123 Fitness Ave, Wellness City', { align: 'center' });
        doc.text('support@smartgym.com | +91 98765 43210', { align: 'center' });
        doc.moveDown(2);

        // --- Title ---
        doc.fontSize(18).text('Welcome to the Family!', { align: 'left' });
        doc.moveDown();
        doc.fontSize(10).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

        // --- Divider ---
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        // --- Client Details ---
        doc.fontSize(14).font('Helvetica-Bold').text('Member Details');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Name: ${user.username}`);
        doc.text(`Email: ${user.email}`);
        doc.text(`Member ID: ${user.member_id}`);
        doc.text(`Phone: ${user.phone_number || 'N/A'}`);
        doc.moveDown();

        // --- Membership Info ---
        doc.fontSize(14).font('Helvetica-Bold').text('Membership Information');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');
        doc.text(`Plan: ${membershipDetails.planName}`);
        doc.text(`Start Date: ${new Date(user.start_date).toLocaleDateString()}`);
        doc.text(`Valid Until: ${membershipDetails.expiryDate}`);
        doc.text(`Status: ${user.membershipStatus.toUpperCase()}`);
        doc.moveDown();

        // --- Invoice Section ---
        doc.fontSize(14).font('Helvetica-Bold').text('Invoice Details');
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const itemX = 50;
        const amountX = 400;

        doc.font('Helvetica-Bold').text('Description', itemX, tableTop);
        doc.text('Amount (INR)', amountX, tableTop);
        doc.moveDown(0.5);
        doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(itemX, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        // Item 1: Total
        let y = doc.y;
        doc.font('Helvetica').text('Membership Fee Total', itemX, y);
        doc.text(`Rs. ${user.total_amount || 0}`, amountX, y);
        doc.moveDown();

        // Item 2: Paid
        y = doc.y;
        doc.text('Amount Paid', itemX, y);
        doc.text(`Rs. ${user.amount_paid || 0}`, amountX, y);
        doc.moveDown();

        // Item 3: Pending
        y = doc.y;
        doc.font('Helvetica-Bold').text('Pending Amount', itemX, y);
        doc.text(`Rs. ${membershipDetails.pendingAmount}`, amountX, y, { color: membershipDetails.pendingAmount > 0 ? 'red' : 'black' });
        doc.moveDown(2);

        // --- Footer & QR ---
        doc.text('Please retain this document for your records.', { align: 'center', color: 'grey' });
        doc.moveDown();

        if (qrCodeBuffer) {
            doc.image(qrCodeBuffer, {
                fit: [100, 100],
                align: 'center',
                valign: 'center'
            });
            doc.moveDown(0.5);
            doc.fontSize(10).text('Scan to Check-In', { align: 'center' });
        }

        doc.end();
    });
}

module.exports = { generateWelcomePDF };
