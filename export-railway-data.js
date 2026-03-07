#!/usr/bin/env node
/**
 * Export all data from Railway PostgreSQL
 * This exports users, admins, and all related data
 */

import { Pool } from 'pg';
import { writeFileSync } from 'fs';
import 'dotenv/config';

const railwayUrl = 'postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway';

const pool = new Pool({
  connectionString: railwayUrl,
  ssl: { rejectUnauthorized: false },
});

async function exportAllData() {
  console.log('📥 Exporting all data from Railway...\n');
  
  const data = {};
  
  // Export users
  try {
    const users = await pool.query('SELECT id, username, email, password, full_name, phone, country, city, address, zip_code, referral_id, referred_by, referral_status, verified, enabled, created_at FROM users ORDER BY created_at');
    data.users = users.rows;
    console.log(`✅ Exported ${users.rows.length} users`);
  } catch (e) {
    console.log(`⚠️  Users: ${e.message}`);
    data.users = [];
  }
  
  // Export admin users
  try {
    const admins = await pool.query('SELECT id, username, email, password, full_name, role, enabled, created_at, created_by FROM admin_users ORDER BY created_at');
    data.admin_users = admins.rows;
    console.log(`✅ Exported ${admins.rows.length} admin users`);
  } catch (e) {
    console.log(`⚠️  Admin users: ${e.message}`);
    data.admin_users = [];
  }
  
  // Export all other tables
  const tables = [
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
  
  for (const table of tables) {
    try {
      const result = await pool.query(`SELECT * FROM ${table} ORDER BY created_at`);
      data[table] = result.rows;
      console.log(`✅ Exported ${result.rows.length} rows from ${table}`);
    } catch (e) {
      console.log(`⚠️  ${table}: ${e.message}`);
      data[table] = [];
    }
  }
  
  // Save to file
  writeFileSync('railway-export.json', JSON.stringify(data, null, 2));
  console.log('\n✅ All data exported to railway-export.json');
  
  // Summary
  console.log('\n📊 Export Summary:');
  console.log(`   Users: ${data.users.length}`);
  console.log(`   Admin Users: ${data.admin_users.length}`);
  console.log(`   Trading Accounts: ${data.trading_accounts?.length || 0}`);
  console.log(`   Deposits: ${data.deposits?.length || 0}`);
  console.log(`   Withdrawals: ${data.withdrawals?.length || 0}`);
  console.log(`   Documents: ${data.documents?.length || 0}`);
  
  await pool.end();
}

exportAllData().catch(console.error);




