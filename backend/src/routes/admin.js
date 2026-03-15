const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /admin/stats - Dashboard stats
router.get('/stats', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        const [[userStats]] = await pool.query(
            `SELECT
        COUNT(*) AS total_users,
        SUM(role = 'student') AS students,
        SUM(role = 'faculty') AS faculty,
        SUM(role = 'admin') AS admins
       FROM users`
        );
        const [[hackStats]] = await pool.query(
            `SELECT
        COUNT(*) AS total,
        SUM(approved = 1) AS approved,
        SUM(approved = 0) AS pending,
        SUM(status = 'active') AS active,
        SUM(status = 'upcoming') AS upcoming,
        SUM(status = 'closed') AS closed
       FROM hackathons`
        );
        const [[enrollStats]] = await pool.query(
            'SELECT COUNT(*) AS total_enrollments FROM enrollments'
        );
        res.json({ users: userStats, hackathons: hackStats, enrollments: enrollStats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /admin/users - All users
router.get('/users', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT u.id, u.email, u.name, u.role, u.created_at,
        COALESCE(s.enrollment_no, f.designation, a.staff_id) AS extra_info,
        COALESCE(s.department, f.department, NULL) AS department
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN faculty f ON f.user_id = u.id
       LEFT JOIN admins a ON a.user_id = u.id
       ORDER BY u.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /admin/users/:id/role - Change user role
router.patch('/users/:id/role', verifyClerk, requireRole('admin'), async (req, res) => {
    const { role } = req.body;
    if (!['student', 'faculty', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
    }
    try {
        await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ message: 'Role updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /admin/users/:id - Delete user
router.delete('/users/:id', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /admin/pending-hackathons - Pending approvals
router.get('/pending-hackathons', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT h.*, u.name AS creator_name, u.email AS creator_email
       FROM hackathons h JOIN users u ON h.created_by = u.id
       WHERE h.approved = 0
       ORDER BY h.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
