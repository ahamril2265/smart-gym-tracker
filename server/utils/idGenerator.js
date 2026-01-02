const { User } = require('../models');
const { Op } = require('sequelize');

/**
 * Generates a sequential Member ID based on role.
 * User: C + 4 digits (e.g., C1001)
 * Admin: A + 4 digits (e.g., A0001)
 * Trainer: T + 4 digits (e.g., T0001)
 */
const generateMemberId = async (role) => {
    let prefix = 'C';
    if (role === 'admin') prefix = 'A';
    if (role === 'trainer') prefix = 'T';

    try {
        // Find the last user with this prefix in member_id
        // We look for IDs that start with the prefix and follow with numbers
        const lastUser = await User.findOne({
            where: {
                member_id: {
                    [Op.like]: `${prefix}%`
                }
            },
            order: [['createdAt', 'DESC']], // Getting the latest created should be safe enough for sequence basics
        });

        let nextNum = 1;
        if (lastUser && lastUser.member_id) {
            // Extract number part
            const currentIdStr = lastUser.member_id.substring(1); // "1028" from "C1028"
            const currentNum = parseInt(currentIdStr, 10);

            if (!isNaN(currentNum)) {
                nextNum = currentNum + 1;
            }
        }

        // For Users, start at 1000 if not set? User asked for C1028 example.
        // Let's stick to 4 digits 0-padded for Admin/Trainer (A0001) and maybe 1000 based for Users if we want?
        // Or just 0-padded for all. user "C1028" implies 1028.
        // Let's assume 1-based index padded to 4 digits.
        // A0001, T0001, C0001. If they want C1028 specifically, maybe they already have old data?
        // I will stick to padding to 4 digits. nextNum.

        // Ensure Users start at 1000 if it's the very first one? 
        // Example "C1028" suggests maybe they want 4 digits.
        // I will output A0001, T0001, C0001.

        return `${prefix}${nextNum.toString().padStart(4, '0')}`;
    } catch (error) {
        console.error("ID Generation Error:", error);
        // Fallback to random if DB fails
        return `${prefix}${Math.floor(Math.random() * 10000)}`;
    }
};

module.exports = { generateMemberId };
