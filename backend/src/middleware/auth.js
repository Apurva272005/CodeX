const { createClerkClient, verifyToken } = require('@clerk/backend');
require('dotenv').config();

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

async function verifyClerk(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing authorization token' });
        }
        const token = authHeader.split(' ')[1];
        const payload = await verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });
        req.userId = payload.sub;
        next();
    } catch (err) {
        console.error('Token verification error:', err.message);
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

module.exports = { verifyClerk, clerkClient };
