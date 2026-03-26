#!/usr/bin/env tsx
/**
 * Check Database Data Script
 * 
 * This script checks what data exists in the current database
 * and helps diagnose why data might be missing
 */

import { Pool } from "pg";
import { storage } from "../server/storage";

async function checkDatabaseData() {
  console.log("🔍 Checking Database Data...\n");
  
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set");
    process.exit(1);
  }
  
  console.log(`📊 Database: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}\n`);
  
  try {
    // Check using storage methods
    console.log("📋 Checking data using storage methods...\n");
    
    const users = await storage.getAllUsers();
    console.log(`👥 Users: ${users.length}`);
    if (users.length > 0) {
      console.log(`   Sample: ${users.slice(0, 3).map(u => u.username).join(', ')}`);
    }
    
    const deposits = await storage.getAllDeposits();
    console.log(`💰 Deposits: ${deposits.length}`);
    
    const withdrawals = await storage.getAllWithdrawals();
    console.log(`💸 Withdrawals: ${withdrawals.length}`);
    
    const accounts = await storage.getAllTradingAccounts();
    console.log(`📊 Trading Accounts: ${accounts.length}`);
    
    const documents = await storage.getAllDocuments();
    console.log(`📄 Documents: ${documents.length}`);
    
    const admins = await storage.getAllAdminUsers();
    console.log(`👨‍💼 Admin Users: ${admins.length}`);
    if (admins.length > 0) {
      console.log(`   Admins: ${admins.map(a => `${a.username} (${a.role})`).join(', ')}`);
    }
    
    // Check directly using SQL
    console.log("\n🔍 Checking directly via SQL...\n");
    
    const pool = new Pool({ 
      connectionString: databaseUrl,
      ssl: databaseUrl.includes('shuttle.proxy.rlwy.net') ? { rejectUnauthorized: false } : undefined
    });
    
    const tables = [
      'users',
      'admin_users',
      'deposits',
      'withdrawals',
      'trading_accounts',
      'documents',
      'notifications',
      'trading_history',
      'support_tickets',
      'activity_logs'
    ];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0].count);
        console.log(`  ${table}: ${count} rows`);
        
        if (count > 0 && (table === 'users' || table === 'admin_users')) {
          const sample = await pool.query(`SELECT * FROM ${table} LIMIT 3`);
          console.log(`    Sample IDs: ${sample.rows.map((r: any) => r.id?.substring(0, 8) || 'N/A').join(', ')}`);
        }
      } catch (error: any) {
        if (error.message.includes('does not exist')) {
          console.log(`  ${table}: Table does not exist`);
        } else {
          console.log(`  ${table}: Error - ${error.message}`);
        }
      }
    }
    
    await pool.end();
    
    console.log("\n✅ Data check complete!");
    
  } catch (error: any) {
    console.error("❌ Error checking data:", error);
    process.exit(1);
  }
}

// Run if executed directly
checkDatabaseData().catch(console.error);

export { checkDatabaseData };

