const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'nijat',
  password: process.env.DB_PASSWORD || 'User123!',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'Portal',
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

if (!config.server || typeof config.server !== 'string') {
  throw new Error('DB_SERVER is required and must be a string. Set it in .env');
}

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => {
    console.error('DB Connection failed', err);
    throw err;
  });

module.exports = {
  sql,
  poolPromise
};
