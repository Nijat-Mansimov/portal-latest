const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/db');

const router = express.Router();

router.post('/login', (req, res, next) => {
  const useLdap = !!process.env.LDAP_URL;
  const loginStrategy = useLdap ? 'ldap' : 'local';

  passport.authenticate(loginStrategy, { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info && info.message ? info.message : 'Invalid credentials' });
    }

    const tokenPayload = {
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      isAdmin: !!user.isAdmin
    };

    try {
      const pool = await poolPromise;
      const userResult = await pool
        .request()
        .input('username', sql.NVarChar(255), user.username)
        .query('SELECT TOP 1 * FROM Users WHERE Username = @username');

      if (userResult.recordset.length === 0) {
        await pool
          .request()
          .input('username', sql.NVarChar(255), user.username)
          .input('displayName', sql.NVarChar(255), user.displayName)
          .input('email', sql.NVarChar(255), user.email)
          .input('isAdmin', sql.Bit, false)
          .query(
            'INSERT INTO Users (Username, DisplayName, Email, IsAdmin, CreatedAt) VALUES (@username, @displayName, @email, @isAdmin, GETUTCDATE())'
          );
      } else {
        tokenPayload.isAdmin = !!userResult.recordset[0].IsAdmin;
        await pool
          .request()
          .input('username', sql.NVarChar(255), user.username)
          .input('displayName', sql.NVarChar(255), user.displayName)
          .input('email', sql.NVarChar(255), user.email)
          .query(
            'UPDATE Users SET DisplayName = @displayName, Email = @email, LastLoginAt = GETUTCDATE() WHERE Username = @username'
          );
      }

      const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'jwt_secret', { expiresIn: '8h' });

      return res.json({ token, user: tokenPayload });
    } catch (dbError) {
      console.error(dbError);
      return res.status(500).json({ message: 'Database error while login' });
    }
  })(req, res, next);
});

router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret');
    
    // Fetch latest IsAdmin status from DB
    try {
      const pool = await poolPromise;
      const userResult = await pool
        .request()
        .input('username', sql.NVarChar(255), payload.username)
        .query('SELECT TOP 1 IsAdmin FROM Users WHERE Username = @username');
        
      if (userResult.recordset.length > 0) {
        payload.isAdmin = !!userResult.recordset[0].IsAdmin;
      }
    } catch (dbErr) {
      console.error('Error fetching user roles for /me:', dbErr);
    }
    
    return res.json(payload);
  } catch (e) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
});
// Local login route (username/password)
router.post('/login-local', (req, res, next) => {
  passport.authenticate('local', { session: false }, async (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).json({ message: info && info.message ? info.message : 'Invalid credentials' });
    }

    const tokenPayload = {
      username: user.username,
      displayName: user.displayName,
      email: user.email,
      isAdmin: !!user.isAdmin
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'jwt_secret', { expiresIn: '8h' });
    return res.json({ token, user: tokenPayload });
  })(req, res, next);
});

// Optional registration endpoint for local users
router.post('/register', async (req, res) => {
  const { username, password, displayName, email } = req.body;
  if (!username || !password || !displayName) {
    return res.status(400).json({ message: 'username, displayName and password are required' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const pool = await poolPromise;

    const existing = await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .query('SELECT TOP 1 * FROM Users WHERE Username = @username');

    if (existing.recordset.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .input('displayName', sql.NVarChar(255), displayName)
      .input('email', sql.NVarChar(255), email || null)
      .input('passwordHash', sql.NVarChar(255), hash)
      .input('isAdmin', sql.Bit, 0)
      .query(
        'INSERT INTO Users (Username, DisplayName, Email, PasswordHash, IsAdmin, CreatedAt) VALUES (@username, @displayName, @email, @passwordHash, @isAdmin, GETUTCDATE())'
      );

    return res.status(201).json({ message: 'User registered' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Registration failed' });
  }
});

module.exports = router;
