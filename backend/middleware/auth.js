const jwt = require('jsonwebtoken');

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized', details: err.message });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user || !req.user.username) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { poolPromise, sql } = require('../config/db');
    const pool = await poolPromise;
    const userResult = await pool
      .request()
      .input('username', sql.NVarChar(255), req.user.username)
      .query('SELECT TOP 1 IsAdmin FROM Users WHERE Username = @username');

    if (userResult.recordset.length === 0 || !userResult.recordset[0].IsAdmin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    req.user.isAdmin = true;
    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    return res.status(500).json({ error: 'Server error checking admin privileges' });
  }
}

module.exports = { requireAuth, requireAdmin };
