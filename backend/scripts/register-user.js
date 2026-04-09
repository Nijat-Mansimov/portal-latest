require('dotenv').config();
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('../config/db');

async function main() {
  const username = process.argv[2];
  const password = process.argv[3];
  const displayName = process.argv[4] || username;
  const email = process.argv[5] || `${username}@example.com`;

  if (!username || !password) {
    console.log('Usage: node scripts/register-user.js <username> <password> [displayName] [email]');
    process.exit(1);
  }

  try {
    const pool = await poolPromise;
    const existing = await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .query('SELECT TOP 1 * FROM Users WHERE Username = @username');

    if (existing.recordset.length > 0) {
      console.log('User already exists:', username);
      process.exit(1);
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .input('displayName', sql.NVarChar(255), displayName)
      .input('email', sql.NVarChar(255), email)
      .input('passwordHash', sql.NVarChar(255), passwordHash)
      .input('isAdmin', sql.Bit, 0)
      .query(
        'INSERT INTO Users (Username, DisplayName, Email, PasswordHash, IsAdmin, CreatedAt) VALUES (@username, @displayName, @email, @passwordHash, @isAdmin, GETUTCDATE())'
      );

    console.log('User registered successfully:', username);
    process.exit(0);
  } catch (err) {
    console.error('Failed to register user:', err);
    process.exit(1);
  }
}

main();
