/**
 * Fix MySQL Schema - Add missing columns
 * This script adds missing columns to existing MySQL tables
 */

import { getDb } from "./db";

export async function fixMySQLSchema() {
  console.log('🔧 Fixing MySQL schema - Adding missing columns...');

  try {
    const db = await getDb();
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    const isMySQL = databaseUrl?.startsWith('mysql://') || databaseUrl?.startsWith('mariadb://');

    if (!isMySQL) {
      console.log('⚠️ Not a MySQL database, skipping MySQL schema fixes');
      return;
    }

    // Get raw connection for executing ALTER TABLE statements
    const { drizzle } = await import('drizzle-orm/mysql2');
    const mysql = await import('mysql2/promise');
    
    const url = new URL(databaseUrl!);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
    });

    const migrations = [
      // Add username column to users table if it doesn't exist
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(255) UNIQUE AFTER id`,
      // Add email_verification_token if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) AFTER password_reset_expires`,
      // Add email_verification_expires if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires TIMESTAMP NULL AFTER email_verification_token`,
      // Add email_verified if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false AFTER email_verification_expires`,
      // Add next_of_kin_name if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS next_of_kin_name VARCHAR(255) AFTER email_verified`,
      // Add next_of_kin_file if missing
      `ALTER TABLE users ADD COLUMN IF NOT EXISTS next_of_kin_file TEXT AFTER next_of_kin_name`,
      
      // Fix withdrawals table - change user_id from INT to VARCHAR if needed
      // First check if it's INT, then alter if necessary
      
      // Fix documents table - add file_name if missing
      `ALTER TABLE documents ADD COLUMN IF NOT EXISTS file_name VARCHAR(255) AFTER file_path`,
      
      // Fix withdrawals table - ensure user_id exists and is correct type
      // Note: This might fail if column already exists with wrong type, handle gracefully
    ];

    for (const migration of migrations) {
      try {
        // MySQL doesn't support "IF NOT EXISTS" in ALTER TABLE ADD COLUMN
        // So we need to check first or use a different approach
        await connection.execute(migration.replace('IF NOT EXISTS', ''));
        console.log(`✅ Executed: ${migration.substring(0, 60)}...`);
      } catch (error: any) {
        // Ignore "Duplicate column" errors
        if (error.code === 'ER_DUP_FIELDNAME') {
          console.log(`⚠️  Column already exists: ${migration.substring(0, 60)}...`);
        } else {
          console.error(`❌ Error executing migration: ${error.message}`);
          console.error(`   Migration: ${migration.substring(0, 100)}`);
        }
      }
    }

    await connection.end();
    console.log('✅ MySQL schema fixes completed');
  } catch (error: any) {
    console.error('❌ Error fixing MySQL schema:', error.message);
    throw error;
  }
}










