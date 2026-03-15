const pool = require('../db');

function requireRole(...roles) {
    return async (req, res, next) => {
        try {
            const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [req.userId]);
            if (rows.length === 0) {
                return res.status(403).json({ error: 'User not found in system. Please complete profile setup.' });
            }
            req.userRole = rows[0].role;
            if (!roles.includes(req.userRole)) {
                return res.status(403).json({ error: 'Access denied: insufficient permissions' });
            }
            next();
        } catch (err) {
            return res.status(500).json({ error: 'Role check failed', detail: err.message });
        }
    };
}

module.exports = { requireRole };
