const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// POST /reminders - Student sets a reminder
router.post('/', verifyClerk, requireRole('student'), async (req, res) => {
    const { hackathon_id, remind_at } = req.body;
    if (!hackathon_id || !remind_at) {
        return res.status(400).json({ error: 'hackathon_id and remind_at are required' });
    }

    try {
        // Check hackathon exists
        const [rows] = await pool.query('SELECT id, title, enroll_deadline FROM hackathons WHERE id = ?', [hackathon_id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });

        const remindDate = new Date(remind_at);
        if (remindDate < new Date()) {
            return res.status(400).json({ error: 'Reminder time must be in the future' });
        }

        // Upsert reminder
        await pool.query(
            `INSERT INTO reminders (hackathon_id, student_id, remind_at, sent)
       VALUES (?, ?, ?, 0)
       ON DUPLICATE KEY UPDATE remind_at = VALUES(remind_at), sent = 0`,
            [hackathon_id, req.userId, remind_at]
        );

        res.status(201).json({ message: 'Reminder set successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /reminders/me - Student's reminders
router.get('/me', verifyClerk, requireRole('student'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT r.id, r.remind_at, r.sent, h.id AS hackathon_id, h.title, h.enroll_deadline
       FROM reminders r JOIN hackathons h ON h.id = r.hackathon_id
       WHERE r.student_id = ?
       ORDER BY r.remind_at ASC`,
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /reminders/:id - Cancel a reminder
router.delete('/:id', verifyClerk, requireRole('student'), async (req, res) => {
    try {
        await pool.query(
            'DELETE FROM reminders WHERE id = ? AND student_id = ?',
            [req.params.id, req.userId]
        );
        res.json({ message: 'Reminder deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
