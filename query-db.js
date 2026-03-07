// Quick database query script
// Usage: node query-db.js

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, 'local.db');
const db = new Database(dbPath);

console.log('📊 Database Query Tool\n');
console.log('Database:', dbPath);
console.log('─'.repeat(50));

// List all tables
console.log('\n📋 Available Tables:');
const tables = db.prepare(`
  SELECT name FROM sqlite_master 
  WHERE type='table' AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`).all();
tables.forEach((table, i) => {
  console.log(`  ${i + 1}. ${table.name}`);
});

// Query admin users
console.log('\n👨‍💼 Admin Users:');
try {
  const admins = db.prepare('SELECT id, username, email, role, enabled FROM admin_users').all();
  if (admins.length === 0) {
    console.log('  No admin users found');
  } else {
    admins.forEach(admin => {
      console.log(`  - ${admin.username} (${admin.role}) - ${admin.enabled ? 'Enabled' : 'Disabled'}`);
    });
  }
} catch (error) {
  console.log('  Error:', error.message);
}

// Query regular users
console.log('\n👥 Regular Users (first 10):');
try {
  const users = db.prepare(`
    SELECT id, username, email, full_name, country, verified, enabled 
    FROM users 
    LIMIT 10
  `).all();
  if (users.length === 0) {
    console.log('  No users found');
  } else {
    users.forEach(user => {
      console.log(`  - ${user.username || user.email} (${user.country || 'N/A'}) - ${user.verified ? 'Verified' : 'Not Verified'}`);
    });
  }
} catch (error) {
  console.log('  Error:', error.message);
}

// Count statistics
console.log('\n📈 Statistics:');
try {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const adminCount = db.prepare('SELECT COUNT(*) as count FROM admin_users').get();
  const verifiedCount = db.prepare('SELECT COUNT(*) as count FROM users WHERE verified = 1').get();
  
  console.log(`  Total Users: ${userCount.count}`);
  console.log(`  Verified Users: ${verifiedCount.count}`);
  console.log(`  Admin Users: ${adminCount.count}`);
} catch (error) {
  console.log('  Error:', error.message);
}

db.close();
console.log('\n✅ Query complete!\n');
