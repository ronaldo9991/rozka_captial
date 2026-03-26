#!/usr/bin/env node
/**
 * Test AWS RDS PostgreSQL Connection
 * 
 * Usage:
 *   node test-aws-rds-connection.js
 * 
 * Or set environment variables:
 *   DATABASE_URL=postgresql://user:pass@host:5432/db node test-aws-rds-connection.js
 */

import { Pool } from 'pg';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL not set!');
  console.log('\nPlease set DATABASE_URL environment variable:');
  console.log('export DATABASE_URL="postgresql://username:password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/database_name?sslmode=require"');
  process.exit(1);
}

// Check if it's AWS RDS
const isAWSRDS = databaseUrl.includes('.rds.amazonaws.com');
const needsSSL = databaseUrl.includes('sslmode=require') || 
                 databaseUrl.includes('shuttle.proxy.rlwy.net') ||
                 databaseUrl.includes('.rds.amazonaws.com');

console.log('🔍 Testing AWS RDS Connection...');
console.log('   Endpoint:', databaseUrl.replace(/:[^:@]+@/, ':****@'));
console.log('   SSL:', needsSSL ? 'Enabled' : 'Disabled');
console.log('');

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: needsSSL ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    console.log('⏳ Connecting to AWS RDS...');
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version, current_database() as database_name');
    
    console.log('✅ Connection successful!');
    console.log('');
    console.log('📊 Database Info:');
    console.log('   Server Time:', result.rows[0].current_time);
    console.log('   PostgreSQL Version:', result.rows[0].pg_version.split(' ')[0] + ' ' + result.rows[0].pg_version.split(' ')[1]);
    console.log('   Database Name:', result.rows[0].database_name);
    console.log('');
    
    // Test if tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    if (tablesResult.rows.length > 0) {
      console.log('📋 Existing Tables:', tablesResult.rows.length);
      tablesResult.rows.forEach(row => {
        console.log('   -', row.table_name);
      });
    } else {
      console.log('📋 No tables found. Run: npm run db:push');
    }
    
    await pool.end();
    console.log('');
    console.log('✅ Connection test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ Connection failed!');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('');
    console.error('🔧 Troubleshooting:');
    console.error('   1. Check your security group allows port 5432 from your IP');
    console.error('   2. Verify username and password are correct');
    console.error('   3. Ensure database name exists');
    console.error('   4. Check if RDS instance is publicly accessible');
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

testConnection();




