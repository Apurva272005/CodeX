const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk, clerkClient } = require('../middleware/auth');

// GET /users/me - Get current user profile + role details
router.get('/me', verifyClerk, async (req, res) => {
    try {
        const [userRows] = await pool.query(
            'SELECT id, email, name, role, created_at FROM users WHERE id = ?',
            [req.userId]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ error: 'User not found. Please complete profile setup.' });
        }
        const user = userRows[0];

        let extra = {};
        if (user.role === 'student') {
            const [rows] = await pool.query(
                'SELECT enrollment_no, department, year FROM students WHERE user_id = ?', [req.userId]
            );
            extra = rows[0] || {};
        } else if (user.role === 'faculty') {
            const [rows] = await pool.query(
                'SELECT department, designation FROM faculty WHERE user_id = ?', [req.userId]
            );
            extra = rows[0] || {};
        } else if (user.role === 'admin') {
            const [rows] = await pool.query(
                'SELECT staff_id FROM admins WHERE user_id = ?', [req.userId]
            );
            extra = rows[0] || {};
        }

        res.json({ ...user, ...extra });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /users/profile - Complete profile after signup (sets role + extra info)
router.post('/profile', verifyClerk, async (req, res) => {
    const { role, name, enrollment_no, department, year, designation, staff_id } = req.body;
    if (!role || !name) {
        return res.status(400).json({ error: 'role and name are required' });
    }

    const conn = await (require('../db')).getConnection();
    try {
        await conn.beginTransaction();

        // Ensure user exists in DB (webhook may not have created them yet)
        const [existingUser] = await conn.query('SELECT id FROM users WHERE id = ?', [req.userId]);
        if (existingUser.length === 0) {
            // User not yet in DB — fetch email from Clerk and create them
            let email = '';
            try {
                const clerkUser = await clerkClient.users.getUser(req.userId);
                email = clerkUser.emailAddresses?.[0]?.emailAddress || '';
            } catch (e) {
                console.error('Could not fetch user from Clerk:', e.message);
            }
            await conn.query(
                'INSERT INTO users (id, email, name, role) VALUES (?, ?, ?, ?)',
                [req.userId, email, name, role]
            );
        } else {
            // User exists — just update role and name
            await conn.query(
                'UPDATE users SET role = ?, name = ? WHERE id = ?',
                [role, name, req.userId]
            );
        }

        if (role === 'student') {
            if (!enrollment_no || !department || !year) {
                throw new Error('enrollment_no, department, and year are required for students');
            }
            await conn.query(
                `INSERT INTO students (user_id, enrollment_no, department, year)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE enrollment_no=VALUES(enrollment_no), department=VALUES(department), year=VALUES(year)`,
                [req.userId, enrollment_no, department, year]
            );
        } else if (role === 'faculty') {
            if (!department || !designation) {
                throw new Error('department and designation are required for faculty');
            }
            await conn.query(
                `INSERT INTO faculty (user_id, department, designation)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE department=VALUES(department), designation=VALUES(designation)`,
                [req.userId, department, designation]
            );
        } else if (role === 'admin') {
            if (!staff_id) throw new Error('staff_id is required for admin');
            await conn.query(
                `INSERT INTO admins (user_id, staff_id)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE staff_id=VALUES(staff_id)`,
                [req.userId, staff_id]
            );
        }

        await conn.commit();
        res.json({ message: 'Profile completed successfully', role });
    } catch (err) {
        await conn.rollback();
        res.status(400).json({ error: err.message });
    } finally {
        conn.release();
    }
});

module.exports = router;
