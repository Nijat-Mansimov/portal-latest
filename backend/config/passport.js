const LdapStrategy = require('passport-ldapauth');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const { poolPromise, sql } = require('./db');

const ldapOptions = {
  server: {
    url: process.env.LDAP_URL,
    bindDN: process.env.LDAP_BIND_DN,
    bindCredentials: process.env.LDAP_BIND_PASSWORD,
    searchBase: process.env.LDAP_SEARCH_BASE,
    searchFilter: '(sAMAccountName={{username}})',
    tlsOptions: { rejectUnauthorized: false }
  }
};

async function validateLocal(username, password, done) {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('username', sql.NVarChar(255), username)
      .query('SELECT TOP 1 * FROM Users WHERE Username = @username');

    if (result.recordset.length === 0) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    const user = result.recordset[0];
    if (!user.PasswordHash) {
      return done(null, false, { message: 'Local login not enabled for user' });
    }

    const isValid = await bcrypt.compare(password, user.PasswordHash);
    if (!isValid) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    return done(null, {
      username: user.Username,
      displayName: user.DisplayName,
      email: user.Email,
      isAdmin: !!user.IsAdmin
    });
  } catch (err) {
    return done(err);
  }
}

function initializePassport(passport) {
  passport.use('ldap', new LdapStrategy(ldapOptions, (user, done) => {
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    const normalized = {
      username: user.sAMAccountName || user.uid || user.cn,
      displayName: user.displayName || user.cn || user.sAMAccountName,
      email: user.mail || user.userPrincipalName || ''
    };
    return done(null, normalized);
  }));

  passport.use('local', new LocalStrategy({ usernameField: 'username', passwordField: 'password' }, validateLocal));
}

module.exports = { initializePassport };
