const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /faculty/hackathons - Faculty's own hackathons
router.get('/hackathons', verifyClerk, requireRole('faculty'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT h.*,
        (SELECT COUNT(*) FROM enrollments e WHERE e.hackathon_id = h.id) AS total_enrollments
       FROM hackathons h
       WHERE h.created_by = ?
       ORDER BY h.created_at DESC`,
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /faculty/profile - Get faculty profile
router.get('/profile', verifyClerk, requireRole('faculty'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.name, u.role, f.department, f.designation
       FROM users u JOIN faculty f ON f.user_id = u.id
       WHERE u.id = ?`,
            [req.userId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Faculty profile not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
