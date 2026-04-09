require('dotenv').config();
const { poolPromise, sql } = require('./config/db');

async function makeAdmin() {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('UPDATE Users SET IsAdmin = 1');
    console.log(`Successfully elevated ${result.rowsAffected} user(s) to Admin.`);
  } catch (e) {
    console.error('Database update failed:', e);
  } finally {
    process.exit(0);
  }
}
makeAdmin();
