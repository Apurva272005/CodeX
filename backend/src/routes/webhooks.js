const express = require('express');
const router = express.Router();
const { Webhook } = require('svix');
const pool = require('../db');
require('dotenv').config();

// Raw body needed for webhook signature verification
router.post('/', express.raw({ type: 'application/json' }), async (req, res) => {
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
        return res.status(500).json({ error: 'Webhook secret not configured' });
    }

    const headers = {
        'svix-id': req.headers['svix-id'],
        'svix-timestamp': req.headers['svix-timestamp'],
        'svix-signature': req.headers['svix-signature'],
    };

    let event;
    try {
        const wh = new Webhook(webhookSecret);
        event = wh.verify(req.body, headers);
    } catch (err) {
        return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const { type, data } = event;

    if (type === 'user.created') {
        const { id, email_addresses, first_name, last_name } = data;
        const email = email_addresses?.[0]?.email_address || '';
        const name = `${first_name || ''} ${last_name || ''}`.trim() || email;
        // Default role — will be updated after profile completion
        try {
            await pool.query(
                'INSERT IGNORE INTO users (id, email, name, role) VALUES (?, ?, ?, ?)',
                [id, email, name, 'student']
            );
            console.log(`✅ User synced from Clerk: ${email}`);
        } catch (err) {
            console.error('DB insert error:', err.message);
        }
    }

    if (type === 'user.deleted') {
        try {
            await pool.query('DELETE FROM users WHERE id = ?', [data.id]);
        } catch (err) {
            console.error('DB delete error:', err.message);
        }
    }

    res.json({ received: true });
});

module.exports = router;
