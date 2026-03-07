const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway',
  ssl: { rejectUnauthorized: false }
});

(async () => {
  try {
    const count = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', count.rows[0].count);
    const users = await pool.query('SELECT id, username, email FROM users ORDER BY created_at DESC');
    console.log('All users:', users.rows.length);
    console.log('First 5:', users.rows.slice(0, 5).map(u => ({ username: u.username, email: u.email })));
    await pool.end();
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
})();
