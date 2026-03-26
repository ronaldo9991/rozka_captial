// Script to check existing users in Railway PostgreSQL database
import { Pool } from 'pg';

// Use Railway public URL (from RAILWAY_DATABASE_READY.md)
const databaseUrl = process.env.DATABASE_URL || 
                    process.env.DATABASE_PUBLIC_URL ||
                    'postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway';

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: databaseUrl.includes('shuttle.proxy.rlwy.net') 
    ? { rejectUnauthorized: false } 
    : undefined,
});

async function checkUsers() {
  try {
    console.log('🔍 Connecting to Railway PostgreSQL...');
    
    // Check connection
    const testResult = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Connected to database');
    console.log('   Server time:', testResult.rows[0].current_time);
    
    // Check if users table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
    
    if (!tableCheck.rows[0].exists) {
      console.log('❌ Users table does not exist');
      process.exit(1);
    }
    
    console.log('✅ Users table exists');
    
    // Count users
    const countResult = await pool.query('SELECT COUNT(*) as count FROM users');
    const userCount = parseInt(countResult.rows[0].count);
    console.log(`\n📊 Total users in database: ${userCount}`);
    
    // Get all users
    const usersResult = await pool.query(`
      SELECT 
        id, 
        username, 
        email, 
        full_name, 
        country,
        verified,
        enabled,
        created_at
      FROM users 
      ORDER BY created_at DESC
    `);
    
    console.log('\n👥 All users:');
    console.log('─'.repeat(100));
    
    if (usersResult.rows.length === 0) {
      console.log('   No users found');
    } else {
      usersResult.rows.forEach((user, index) => {
        console.log(`\n${index + 1}. User ID: ${user.id}`);
        console.log(`   Username: ${user.username || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Full Name: ${user.full_name || 'N/A'}`);
        console.log(`   Country: ${user.country || 'N/A'}`);
        console.log(`   Verified: ${user.verified ? 'Yes' : 'No'}`);
        console.log(`   Enabled: ${user.enabled ? 'Yes' : 'No'}`);
        console.log(`   Created: ${user.created_at || 'N/A'}`);
      });
    }
    
    // Check admin users
    const adminCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      );
    `);
    
    if (adminCheck.rows[0].exists) {
      const adminCount = await pool.query('SELECT COUNT(*) as count FROM admin_users');
      console.log(`\n👨‍💼 Total admin users: ${parseInt(adminCount.rows[0].count)}`);
    }
    
    console.log('\n✅ Check complete');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await pool.end();
  }
}

checkUsers();

