#!/usr/bin/env tsx
/**
 * Verify Database Connection Script
 * 
 * This script verifies the current database connection and shows
 * which database provider is being used (AWS RDS, Railway, or local)
 */

import { getDb, pool } from "../server/db.js";

async function verifyConnection() {
  console.log("🔍 Verifying Database Connection...\n");
  
  const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL not set!");
    console.error("   Please set DATABASE_URL environment variable");
    process.exit(1);
  }
  
  // Mask password in connection string
  const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ':****@');
  console.log(`📊 Database URL: ${maskedUrl}\n`);
  
  // Detect database provider
  let provider = "Unknown";
  if (databaseUrl.includes('.rds.amazonaws.com')) {
    provider = "AWS RDS PostgreSQL";
  } else if (databaseUrl.includes('railway') || databaseUrl.includes('rlwy.net')) {
    provider = "Railway PostgreSQL";
  } else if (databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')) {
    provider = "Local PostgreSQL";
  } else if (databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')) {
    provider = "PostgreSQL";
  } else {
    provider = "SQLite (Local)";
  }
  
  console.log(`🏢 Database Provider: ${provider}\n`);
  
  try {
    // Wait for database initialization
    const db = await getDb();
    
    // Test connection with a simple query
    if (pool) {
      const result = await pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as db_name');
      console.log("✅ Database Connection: SUCCESS\n");
      console.log(`   Server Time: ${result.rows[0].current_time}`);
      console.log(`   PostgreSQL Version: ${result.rows[0].pg_version.split(' ')[0]} ${result.rows[0].pg_version.split(' ')[1]}`);
      console.log(`   Database Name: ${result.rows[0].db_name}\n`);
      
      // Check if tables exist
      const tablesResult = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
      `);
      
      console.log(`📋 Tables Found: ${tablesResult.rows.length}`);
      if (tablesResult.rows.length > 0) {
        const tableNames = tablesResult.rows.map(r => r.table_name).join(', ');
        console.log(`   ${tableNames}\n`);
      }
      
      // Check data counts
      try {
        const usersCount = await pool.query('SELECT COUNT(*) as count FROM users');
        const depositsCount = await pool.query('SELECT COUNT(*) as count FROM deposits');
        const withdrawalsCount = await pool.query('SELECT COUNT(*) as count FROM withdrawals');
        const accountsCount = await pool.query('SELECT COUNT(*) as count FROM trading_accounts');
        const documentsCount = await pool.query('SELECT COUNT(*) as count FROM documents');
        const adminsCount = await pool.query('SELECT COUNT(*) as count FROM admin_users');
        
        console.log("📊 Data Counts:");
        console.log(`   Users: ${usersCount.rows[0].count}`);
        console.log(`   Deposits: ${depositsCount.rows[0].count}`);
        console.log(`   Withdrawals: ${withdrawalsCount.rows[0].count}`);
        console.log(`   Trading Accounts: ${accountsCount.rows[0].count}`);
        console.log(`   Documents: ${documentsCount.rows[0].count}`);
        console.log(`   Admin Users: ${adminsCount.rows[0].count}\n`);
      } catch (error: any) {
        console.log("⚠️  Could not fetch data counts (tables may not exist yet)\n");
      }
      
    } else {
      console.log("⚠️  Using SQLite database (not PostgreSQL)");
    }
    
    console.log("✅ Database verification complete!");
    
  } catch (error: any) {
    console.error("❌ Database Connection: FAILED\n");
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code || 'N/A'}\n`);
    
    if (error.code === 'ECONNREFUSED') {
      console.error("💡 Connection refused. Check if:");
      console.error("   - Database server is running");
      console.error("   - Host and port are correct");
      console.error("   - Security group/firewall allows connections");
    } else if (error.code === 'ENOTFOUND') {
      console.error("💡 Host not found. Check if:");
      console.error("   - Database hostname is correct");
      console.error("   - DNS resolution is working");
    } else if (error.message.includes('password')) {
      console.error("💡 Authentication failed. Check if:");
      console.error("   - Username and password are correct");
    } else if (error.message.includes('SSL')) {
      console.error("💡 SSL connection failed. Check if:");
      console.error("   - SSL is required and properly configured");
      console.error("   - For AWS RDS, ensure 'sslmode=require' is in connection string");
    }
    
    process.exit(1);
  }
}

verifyConnection().catch(console.error);

