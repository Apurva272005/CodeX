const express = require('express');
const router = express.Router();
const pool = require('../db');
const { verifyClerk } = require('../middleware/auth');
const { requireRole } = require('../middleware/role');

// POST /enrollments - Student enrolls in a hackathon
router.post('/', verifyClerk, requireRole('student'), async (req, res) => {
    const { hackathon_id, team_name, mode, member_emails } = req.body;

    if (!hackathon_id || !team_name || !mode) {
        return res.status(400).json({ error: 'hackathon_id, team_name, and mode are required' });
    }

    const validModes = ['solo', 'duo', 'group'];
    if (!validModes.includes(mode)) {
        return res.status(400).json({ error: 'Mode must be solo, duo, or group' });
    }

    try {
        // Check hackathon exists and deadline not passed
        const [hackRows] = await pool.query(
            'SELECT id, enroll_deadline, min_team_size, max_team_size, approved FROM hackathons WHERE id = ?',
            [hackathon_id]
        );
        if (hackRows.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
        const hack = hackRows[0];
        if (!hack.approved) return res.status(400).json({ error: 'Hackathon is not open for enrollment yet' });
        if (new Date(hack.enroll_deadline) < new Date()) {
            return res.status(400).json({ error: 'Enrollment deadline has passed' });
        }

        // Validate and fetch member IDs
        const leaderEmail = (await pool.query('SELECT email FROM users WHERE id = ?', [req.userId]))[0][0].email;
        const extras = Array.isArray(member_emails) ? [...new Set(member_emails.filter(e => e && e !== leaderEmail))] : [];

        let memberIds = [req.userId];
        if (extras.length > 0) {
            const placeholders = extras.map(() => '?').join(',');
            const [memberRows] = await pool.query(
                `SELECT id, email FROM users WHERE email IN (${placeholders}) AND role = 'student'`,
                extras
            );
            if (memberRows.length !== extras.length) {
                return res.status(400).json({ error: 'One or more member emails are not registered students' });
            }
            memberIds.push(...memberRows.map(m => m.id));
        }

        // Check if ANY member is already enrolled
        const placeholders = memberIds.map(() => '?').join(',');
        const [conflicts] = await pool.query(
            `SELECT u.email FROM enrollment_members em
             JOIN users u ON u.id = em.student_id
             JOIN enrollments e ON e.id = em.enrollment_id
             WHERE e.hackathon_id = ? AND em.student_id IN (${placeholders})`,
            [hackathon_id, ...memberIds]
        );

        if (conflicts.length > 0) {
            const emails = conflicts.map(c => c.email).join(', ');
            return res.status(400).json({ error: `The following users are already enrolled in this hackathon: ${emails}` });
        }

        if (mode === 'solo' && memberIds.length !== 1) return res.status(400).json({ error: 'Solo mode requires exactly 1 member' });
        if (mode === 'duo' && memberIds.length !== 2) return res.status(400).json({ error: 'Duo mode requires exactly 2 members' });
        if (mode === 'group' && (memberIds.length < 3 || memberIds.length > hack.max_team_size)) {
            return res.status(400).json({ error: `Group mode requires 3 to ${hack.max_team_size} members` });
        }

        // Insert enrollment
        const [result] = await pool.query(
            'INSERT INTO enrollments (hackathon_id, team_name, mode, leader_id) VALUES (?, ?, ?, ?)',
            [hackathon_id, team_name, mode, req.userId]
        );
        const enrollId = result.insertId;

        // Insert members
        const memberValues = memberIds.map(id => [enrollId, id]);
        await pool.query('INSERT INTO enrollment_members (enrollment_id, student_id) VALUES ?', [memberValues]);

        res.status(201).json({ message: 'Enrollment successful', enrollment_id: enrollId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /enrollments/me - Student's own enrollments
router.get('/me', verifyClerk, requireRole('student'), async (req, res) => {
    try {
        const [rows] = await pool.query(
            `SELECT e.id, e.team_name, e.mode, e.submitted_at,
              h.id AS hackathon_id, h.title, h.enroll_deadline, h.start_date, h.end_date,
              h.venue, h.prize_pool, h.status,
              u_leader.name AS leader_name,
              GROUP_CONCAT(u_member.name SEPARATOR ', ') AS members
       FROM enrollments e
       JOIN enrollment_members em ON em.enrollment_id = e.id
       JOIN hackathons h ON h.id = e.hackathon_id
       JOIN users u_leader ON u_leader.id = e.leader_id
       JOIN enrollment_members em_all ON em_all.enrollment_id = e.id
       JOIN users u_member ON u_member.id = em_all.student_id
       WHERE em.student_id = ?
       GROUP BY e.id
       ORDER BY e.submitted_at DESC`,
            [req.userId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /enrollments/hackathon/:id - Participants of a hackathon (Faculty/Admin)
router.get('/hackathon/:id', verifyClerk, requireRole('faculty', 'admin'), async (req, res) => {
    try {
        // Faculty can only view their own hackathon participants
        if (req.userRole === 'faculty') {
            const [hack] = await pool.query(
                'SELECT created_by FROM hackathons WHERE id = ?', [req.params.id]
            );
            if (hack.length === 0) return res.status(404).json({ error: 'Hackathon not found' });
            if (hack[0].created_by !== req.userId) {
                return res.status(403).json({ error: 'Access denied: not your hackathon' });
            }
        }

        const [rows] = await pool.query(
            `SELECT e.id, e.team_name, e.mode, e.submitted_at,
              u.name AS leader_name, u.email AS leader_email,
              GROUP_CONCAT(um.name SEPARATOR ', ') AS members
       FROM enrollments e
       JOIN users u ON u.id = e.leader_id
       JOIN enrollment_members em ON em.enrollment_id = e.id
       JOIN users um ON um.id = em.student_id
       WHERE e.hackathon_id = ?
       GROUP BY e.id
       ORDER BY e.submitted_at ASC`,
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /enrollments/hackathon/:id/export - Export participants to CSV
router.get('/hackathon/:id/export', verifyClerk, requireRole('faculty', 'admin'), async (req, res) => {
    try {
        if (req.userRole === 'faculty') {
            const [hack] = await pool.query('SELECT created_by FROM hackathons WHERE id = ?', [req.params.id]);
            if (hack.length === 0 || hack[0].created_by !== req.userId) {
                return res.status(403).json({ error: 'Access denied' });
            }
        }

        const [rows] = await pool.query(
            `SELECT e.team_name, e.mode, e.submitted_at,
              u.name AS leader_name, u.email AS leader_email,
              GROUP_CONCAT(um.name SEPARATOR '; ') AS members
       FROM enrollments e
       JOIN users u ON u.id = e.leader_id
       JOIN enrollment_members em ON em.enrollment_id = e.id
       JOIN users um ON um.id = em.student_id
       WHERE e.hackathon_id = ?
       GROUP BY e.id
       ORDER BY e.submitted_at ASC`,
            [req.params.id]
        );

        let csv = 'Team Name,Mode,Leader Name,Leader Email,Members,Enrolled On\n';
        rows.forEach(r => {
            csv += `"${r.team_name}","${r.mode}","${r.leader_name}","${r.leader_email}","${r.members}","${r.submitted_at.toISOString()}"\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=participants_${req.params.id}.csv`);
        res.status(200).send(csv);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
