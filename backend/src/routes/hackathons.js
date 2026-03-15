const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// GET /hackathons - All approved hackathons (public-ish, requires login)
router.get('/', verifyClerk, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT h.*, u.name AS creator_name
       FROM hackathons h
       JOIN users u ON h.created_by = u.id
       WHERE h.approved = 1
       ORDER BY h.enroll_deadline ASC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /hackathons/all - All hackathons (admin only)
router.get('/all', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT h.*, u.name AS creator_name
       FROM hackathons h
       JOIN users u ON h.created_by = u.id
       ORDER BY h.created_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /hackathons/:id - Single hackathon
router.get('/:id', verifyClerk, async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT h.*, u.name AS creator_name, u.email AS creator_email
       FROM hackathons h JOIN users u ON h.created_by = u.id
       WHERE h.id = ?`,
            [req.params.id]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /hackathons - Create (faculty or admin)
router.post('/', verifyClerk, requireRole('faculty', 'admin'), async (req, res) => {
    const {
        title, description, banner_url, type, field, prize_pool,
        max_team_size, min_team_size, start_date, end_date, enroll_deadline, venue
    } = req.body;

    if (!title || !description || !type || !field || !prize_pool ||
        !start_date || !end_date || !enroll_deadline || !venue) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Admins auto-approve, faculty need approval
        const approved = req.userRole === 'admin' ? 1 : 0;
        const [result] = await pool.query(
            `INSERT INTO hackathons
        (title, description, banner_url, type, field, prize_pool, max_team_size, min_team_size,
         start_date, end_date, enroll_deadline, venue, created_by, approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, description, banner_url || '', type, field, prize_pool,
                max_team_size || 4, min_team_size || 1,
                start_date, end_date, enroll_deadline, venue, req.userId, approved]
        );
        res.status(201).json({ id: result.insertId, message: approved ? 'Hackathon created and published' : 'Hackathon submitted for admin approval' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /hackathons/:id - Update
router.put('/:id', verifyClerk, requireRole('faculty', 'admin'), async (req, res) => {
    try {
        const [existing] = await pool.query('SELECT created_by FROM hackathons WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
        if (req.userRole !== 'admin' && existing[0].created_by !== req.userId) {
            return res.status(403).json({ error: 'You can only edit your own hackathons' });
        }

        const {
            title, description, banner_url, type, field, prize_pool,
            max_team_size, min_team_size, start_date, end_date, enroll_deadline, venue, status
        } = req.body;

        await pool.query(
            `UPDATE hackathons SET title=?, description=?, banner_url=?, type=?, field=?, prize_pool=?,
       max_team_size=?, min_team_size=?, start_date=?, end_date=?, enroll_deadline=?, venue=?, status=?
       WHERE id=?`,
            [title, description, banner_url || '', type, field, prize_pool,
                max_team_size, min_team_size, start_date, end_date, enroll_deadline, venue, status, req.params.id]
        );
        res.json({ message: 'Hackathon updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /hackathons/:id
router.delete('/:id', verifyClerk, requireRole('faculty', 'admin'), async (req, res) => {
    try {
        const [existing] = await pool.query('SELECT created_by FROM hackathons WHERE id = ?', [req.params.id]);
        if (existing.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
        if (req.userRole !== 'admin' && existing[0].created_by !== req.userId) {
            return res.status(403).json({ error: 'You can only delete your own hackathons' });
        }
        await pool.query('DELETE FROM hackathons WHERE id = ?', [req.params.id]);
        res.json({ message: 'Hackathon deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /hackathons/:id/approve - Admin approve
router.patch('/:id/approve', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        await pool.query('UPDATE hackathons SET approved = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Hackathon approved and published' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PATCH /hackathons/:id/reject - Admin reject (delete)
router.patch('/:id/reject', verifyClerk, requireRole('admin'), async (req, res) => {
    try {
        await pool.query('DELETE FROM hackathons WHERE id = ? AND approved = 0', [req.params.id]);
        res.json({ message: 'Hackathon rejected and removed' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
