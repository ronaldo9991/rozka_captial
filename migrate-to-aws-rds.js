#!/usr/bin/env node
/**
 * Complete Database Migration: Railway PostgreSQL → AWS RDS PostgreSQL
 * 
 * This script:
 * 1. Exports all data from Railway PostgreSQL
 * 2. Imports all data to AWS RDS PostgreSQL
 * 3. Verifies data integrity
 * 
 * Usage:
 *   node migrate-to-aws-rds.js
 */

import { Pool } from 'pg';
import 'dotenv/config';
import { readFileSync } from 'fs';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Get connection strings
const railwayUrl = process.env.RAILWAY_DATABASE_URL || 
                   'postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway';

const awsRdsUrl = process.env.AWS_RDS_URL;

if (!awsRdsUrl) {
  log('❌ AWS_RDS_URL environment variable not set!', 'red');
  log('\nPlease set AWS_RDS_URL:', 'yellow');
  log('export AWS_RDS_URL="postgresql://username:password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/database_name?sslmode=require"', 'cyan');
  process.exit(1);
}

// All tables to migrate (in order to respect foreign keys)
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
  'user_sessions', // Session table if exists
];

async function createPools() {
  log('\n🔌 Creating database connections...', 'blue');
  
  const railwayPool = new Pool({
    connectionString: railwayUrl,
    ssl: railwayUrl.includes('shuttle.proxy.rlwy.net') 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  const awsPool = new Pool({
    connectionString: awsRdsUrl,
    ssl: awsRdsUrl.includes('.rds.amazonaws.com') || awsRdsUrl.includes('sslmode=require')
      ? { rejectUnauthorized: false }
      : undefined,
  });

  // Test connections
  try {
    log('   Testing Railway connection...', 'cyan');
    await railwayPool.query('SELECT NOW()');
    log('   ✅ Railway connected', 'green');
  } catch (error) {
    log(`   ❌ Railway connection failed: ${error.message}`, 'red');
    throw error;
  }

  try {
    log('   Testing AWS RDS connection...', 'cyan');
    await awsPool.query('SELECT NOW()');
    log('   ✅ AWS RDS connected', 'green');
  } catch (error) {
    log(`   ❌ AWS RDS connection failed: ${error.message}`, 'red');
    throw error;
  }

  return { railwayPool, awsPool };
}

async function getTableData(pool, tableName) {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName} ORDER BY created_at ASC`);
    return result.rows;
  } catch (error) {
    // Table might not exist or might be empty
    if (error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

async function insertTableData(pool, tableName, rows) {
  if (rows.length === 0) {
    log(`   ⏭️  Skipping ${tableName} (empty)`, 'yellow');
    return 0;
  }

  // Get column names from first row
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  const columnNames = columns.join(', ');

  // Build INSERT query with ON CONFLICT DO NOTHING to avoid duplicates
  const query = `
    INSERT INTO ${tableName} (${columnNames})
    VALUES (${placeholders})
    ON CONFLICT DO NOTHING
  `;

  let inserted = 0;
  for (const row of rows) {
    try {
      const values = columns.map(col => {
        // Handle null values and dates
        if (row[col] === null) return null;
        if (row[col] instanceof Date) return row[col].toISOString();
        return row[col];
      });
      
      const result = await pool.query(query, values);
      if (result.rowCount > 0) inserted++;
    } catch (error) {
      // Skip duplicate key errors
      if (error.code === '23505') continue;
      throw error;
    }
  }

  return inserted;
}

async function migrateTable(railwayPool, awsPool, tableName) {
  log(`\n📦 Migrating ${tableName}...`, 'blue');
  
  try {
    // Export from Railway
    log(`   📥 Exporting from Railway...`, 'cyan');
    const data = await getTableData(railwayPool, tableName);
    log(`   ✅ Exported ${data.length} rows`, 'green');

    if (data.length === 0) {
      log(`   ⏭️  No data to migrate`, 'yellow');
      return { exported: 0, imported: 0 };
    }

    // Import to AWS RDS
    log(`   📤 Importing to AWS RDS...`, 'cyan');
    const imported = await insertTableData(awsPool, tableName, data);
    log(`   ✅ Imported ${imported} rows`, 'green');

    return { exported: data.length, imported };
  } catch (error) {
    log(`   ❌ Error migrating ${tableName}: ${error.message}`, 'red');
    throw error;
  }
}

async function verifyMigration(railwayPool, awsPool) {
  log('\n🔍 Verifying migration...', 'blue');
  
  const results = {};
  
  for (const table of tables) {
    try {
      const railwayCount = await railwayPool.query(`SELECT COUNT(*) as count FROM ${table}`).then(r => parseInt(r.rows[0].count));
      const awsCount = await awsPool.query(`SELECT COUNT(*) as count FROM ${table}`).then(r => parseInt(r.rows[0].count));
      
      results[table] = { railway: railwayCount, aws: awsCount, match: railwayCount === awsCount };
      
      if (railwayCount === awsCount) {
        log(`   ✅ ${table}: ${railwayCount} rows (match)`, 'green');
      } else {
        log(`   ⚠️  ${table}: Railway=${railwayCount}, AWS=${awsCount} (mismatch)`, 'yellow');
      }
    } catch (error) {
      // Table might not exist
      log(`   ⏭️  ${table}: Skipped (table not found)`, 'yellow');
    }
  }
  
  return results;
}

async function main() {
  log('\n🚀 Starting Database Migration: Railway → AWS RDS', 'blue');
  log('='.repeat(60), 'blue');
  
  let railwayPool, awsPool;
  
  try {
    // Create connections
    const pools = await createPools();
    railwayPool = pools.railwayPool;
    awsPool = pools.awsPool;

    // Ensure AWS RDS has schema
    log('\n📋 Ensuring AWS RDS schema exists...', 'blue');
    log('   Run: npm run db:push (if not already done)', 'yellow');
    
    // Migrate each table
    const migrationResults = {};
    
    for (const table of tables) {
      const result = await migrateTable(railwayPool, awsPool, table);
      migrationResults[table] = result;
    }

    // Verify migration
    const verification = await verifyMigration(railwayPool, awsPool);

    // Summary
    log('\n' + '='.repeat(60), 'blue');
    log('📊 Migration Summary', 'blue');
    log('='.repeat(60), 'blue');
    
    let totalExported = 0;
    let totalImported = 0;
    
    for (const [table, result] of Object.entries(migrationResults)) {
      totalExported += result.exported;
      totalImported += result.imported;
      log(`${table}: ${result.exported} exported → ${result.imported} imported`, 'cyan');
    }
    
    log(`\nTotal: ${totalExported} rows exported, ${totalImported} rows imported`, 'green');
    
    // Check verification
    const allMatch = Object.values(verification).every(r => r.match !== false);
    if (allMatch) {
      log('\n✅ Migration completed successfully!', 'green');
    } else {
      log('\n⚠️  Migration completed with some mismatches. Please review.', 'yellow');
    }

  } catch (error) {
    log(`\n❌ Migration failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  } finally {
    if (railwayPool) await railwayPool.end();
    if (awsPool) await awsPool.end();
  }
}

main();

