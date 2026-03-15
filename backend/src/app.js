require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const nodemailer = require('nodemailer');
const pool = require('./db');

const app = express();

// CORS
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));

// Webhook route needs raw body — mount BEFORE express.json()
const webhookRouter = require('./routes/webhooks');
app.use('/webhooks/clerk', webhookRouter);

// JSON body parser for all other routes
app.use(express.json());

// Routes
const hackathonRoutes = require('./routes/hackathons');
const enrollmentRoutes = require('./routes/enrollments');
const reminderRoutes = require('./routes/reminders');
const facultyRoutes = require('./routes/faculty');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');

app.use('/hackathons', hackathonRoutes);
app.use('/enrollments', enrollmentRoutes);
app.use('/reminders', reminderRoutes);
app.use('/faculty', facultyRoutes);
app.use('/admin', adminRoutes);
app.use('/users', userRoutes);

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

// ─── Email Reminder Cron Job ─────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Run every 15 minutes
cron.schedule('*/15 * * * *', async () => {
    try {
        const [pending] = await pool.query(
            `SELECT r.id, r.student_id, r.hackathon_id,
              u.email, u.name,
              h.title, h.enroll_deadline
       FROM reminders r
       JOIN users u ON u.id = r.student_id
       JOIN hackathons h ON h.id = r.hackathon_id
       WHERE r.remind_at <= NOW() AND r.sent = 0`
        );

        for (const reminder of pending) {
            const deadline = new Date(reminder.enroll_deadline).toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                dateStyle: 'long',
                timeStyle: 'short',
            });

            await transporter.sendMail({
                from: process.env.EMAIL_FROM,
                to: reminder.email,
                subject: `⏰ Reminder: Enroll in "${reminder.title}" — Deadline approaching!`,
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
            <h2 style="color: #4F46E5;">CodeX Hackathon Reminder</h2>
            <p>Hi <strong>${reminder.name}</strong>,</p>
            <p>This is a reminder that you set for the hackathon:</p>
            <div style="background: #F3F4F6; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <h3 style="margin:0; color: #111827;">${reminder.title}</h3>
              <p style="margin: 8px 0 0; color: #6B7280;">Enrollment Deadline: <strong>${deadline}</strong></p>
            </div>
            <p>Don't miss out — enroll now on <a href="${process.env.FRONTEND_URL}" style="color: #4F46E5;">CodeX</a>!</p>
            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 24px 0;" />
            <p style="color: #9CA3AF; font-size: 12px;">CodeX · University Hackathon Management Platform</p>
          </div>
        `,
            });

            await pool.query('UPDATE reminders SET sent = 1 WHERE id = ?', [reminder.id]);
            console.log(`📧 Reminder sent to ${reminder.email} for "${reminder.title}"`);
        }
    } catch (err) {
        console.error('Cron job error:', err.message);
    }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 CodeX Backend running on http://localhost:${PORT}`);
});
