import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkTable() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found');
    process.exit(1);
  }

  // Parse MySQL connection string
  const url = new URL(databaseUrl.replace('mysql://', 'http://'));
  const pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  });

  try {
    // Check if table exists and get its structure
    const [rows] = await pool.execute('DESCRIBE fund_transfers');
    console.log('Current fund_transfers table structure:');
    console.log(JSON.stringify(rows, null, 2));
    
    // Check if user_id column exists
    const columns = rows as any[];
    const hasUserId = columns.some((col: any) => col.Field === 'user_id');
    const hasNotes = columns.some((col: any) => col.Field === 'notes');
    const hasProcessedBy = columns.some((col: any) => col.Field === 'processed_by');
    const hasProcessedAt = columns.some((col: any) => col.Field === 'processed_at');
    const hasType = columns.some((col: any) => col.Field === 'type');
    const hasCompletedAt = columns.some((col: any) => col.Field === 'completed_at');
    
    console.log('\nColumn checks:');
    console.log(`- user_id: ${hasUserId ? '✓' : '✗'}`);
    console.log(`- notes: ${hasNotes ? '✓' : '✗'}`);
    console.log(`- processed_by: ${hasProcessedBy ? '✓' : '✗'}`);
    console.log(`- processed_at: ${hasProcessedAt ? '✓' : '✗'}`);
    console.log(`- type (should not exist): ${hasType ? '✗' : '✓'}`);
    console.log(`- completed_at (should not exist): ${hasCompletedAt ? '✗' : '✓'}`);
    
    if (!hasUserId || !hasNotes || !hasProcessedBy || !hasProcessedAt || hasType || hasCompletedAt) {
      console.log('\n⚠️  Table structure needs to be updated!');
      console.log('Run the migration to update the table structure.');
    } else {
      console.log('\n✅ Table structure is correct!');
    }
  } catch (error: any) {
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.log('Table fund_transfers does not exist. It will be created on next startup.');
    } else {
      console.error('Error checking table:', error.message);
    }
  } finally {
    await pool.end();
  }
}

checkTable().catch(console.error);

