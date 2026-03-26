#!/usr/bin/env node
/**
 * Import exported Railway data to AWS RDS
 * Uses railway-export.json file
 */

import { Pool } from 'pg';
import { readFileSync } from 'fs';
import 'dotenv/config';

const awsRdsUrl = process.env.AWS_RDS_URL;

if (!awsRdsUrl) {
  console.error('❌ AWS_RDS_URL not set!');
  console.log('\nPlease set:');
  console.log('export AWS_RDS_URL="postgresql://username:password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/database_name?sslmode=require"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: awsRdsUrl,
  ssl: awsRdsUrl.includes('.rds.amazonaws.com') || awsRdsUrl.includes('sslmode=require')
    ? { rejectUnauthorized: false }
    : undefined,
});

async function importData() {
  console.log('📤 Importing data to AWS RDS...\n');
  
  // Test connection
  try {
    await pool.query('SELECT NOW()');
    console.log('✅ Connected to AWS RDS\n');
  } catch (error) {
    console.error(`❌ Connection failed: ${error.message}`);
    process.exit(1);
  }
  
  // Load exported data
  let data;
  try {
    data = JSON.parse(readFileSync('railway-export.json', 'utf8'));
    console.log('✅ Loaded railway-export.json\n');
  } catch (error) {
    console.error(`❌ Failed to load railway-export.json: ${error.message}`);
    process.exit(1);
  }
  
  // Import function
  async function importTable(tableName, rows) {
    if (!rows || rows.length === 0) {
      console.log(`⏭️  ${tableName}: No data to import`);
      return 0;
    }
    
    const columns = Object.keys(rows[0]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const columnNames = columns.join(', ');
    
    const query = `
      INSERT INTO ${tableName} (${columnNames})
      VALUES (${placeholders})
      ON CONFLICT DO NOTHING
    `;
    
    let imported = 0;
    for (const row of rows) {
      try {
        const values = columns.map(col => {
          if (row[col] === null) return null;
          if (row[col] instanceof Date) return row[col].toISOString();
          return row[col];
        });
        
        const result = await pool.query(query, values);
        if (result.rowCount > 0) imported++;
      } catch (error) {
        if (error.code === '23505') continue; // Skip duplicates
        console.error(`   ⚠️  Error importing row: ${error.message}`);
      }
    }
    
    return imported;
  }
  
  // Import in order
  const tables = [
    'users',
    'admin_users',
    'trading_accounts',
    'deposits',
    'withdrawals',
    'trading_history',
    'documents',
    'notifications',
    'admin_country_assignments',
    'activity_logs',
    'support_tickets',
    'support_ticket_replies',
    'fund_transfers',
    'ib_cb_wallets',
    'crypto_wallets',
    'stripe_payments',
  ];
  
  const results = {};
  
  for (const table of tables) {
    if (data[table]) {
      console.log(`📦 Importing ${table}...`);
      const imported = await importTable(table, data[table]);
      results[table] = imported;
      console.log(`   ✅ Imported ${imported} rows\n`);
    } else {
      console.log(`⏭️  ${table}: No data\n`);
    }
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 Import Summary:');
  console.log('='.repeat(60));
  let total = 0;
  for (const [table, count] of Object.entries(results)) {
    console.log(`   ${table}: ${count} rows`);
    total += count;
  }
  console.log(`\n✅ Total: ${total} rows imported`);
  
  // Verify
  console.log('\n🔍 Verifying...');
  try {
    const userCount = await pool.query('SELECT COUNT(*) FROM users').then(r => r.rows[0].count);
    const adminCount = await pool.query('SELECT COUNT(*) FROM admin_users').then(r => r.rows[0].count);
    console.log(`   Users: ${userCount}`);
    console.log(`   Admin Users: ${adminCount}`);
  } catch (e) {
    console.log(`   ⚠️  Verification error: ${e.message}`);
  }
  
  await pool.end();
}

importData().catch(console.error);




