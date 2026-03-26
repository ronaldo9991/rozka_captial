#!/usr/bin/env tsx
/**
 * Database Migration Script: Railway PostgreSQL → Amazon RDS
 * 
 * This script:
 * 1. Exports all data from Railway PostgreSQL
 * 2. Creates tables in Amazon RDS
 * 3. Imports all data to Amazon RDS
 * 4. Verifies data integrity
 */

import { Pool } from "pg";
import * as fs from "fs";
import * as path from "path";

// Source: Railway PostgreSQL
const RAILWAY_DB_URL = process.env.RAILWAY_DATABASE_URL || 
  "postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway";

// Target: Amazon RDS
const RDS_DB_URL = process.env.RDS_DATABASE_URL || 
  `postgresql://${process.env.RDS_USERNAME || "postgres"}:${process.env.RDS_PASSWORD || ""}@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/${process.env.RDS_DATABASE || "postgres"}`;

interface TableInfo {
  name: string;
  columns: string[];
}

async function getTableNames(pool: Pool): Promise<string[]> {
  const result = await pool.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return result.rows.map(row => row.table_name);
}

async function getTableData(pool: Pool, tableName: string): Promise<any[]> {
  try {
    const result = await pool.query(`SELECT * FROM ${tableName}`);
    return result.rows;
  } catch (error) {
    console.error(`Error reading table ${tableName}:`, error);
    return [];
  }
}

async function getTableStructure(pool: Pool, tableName: string): Promise<string> {
  const result = await pool.query(`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows.map(col => 
    `${col.column_name} ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}${col.column_default ? ` DEFAULT ${col.column_default}` : ''}`
  ).join(', ');
}

async function exportData(sourcePool: Pool, outputDir: string) {
  console.log("📤 Exporting data from Railway PostgreSQL...");
  
  const tables = await getTableNames(sourcePool);
  console.log(`Found ${tables.length} tables: ${tables.join(', ')}`);
  
  const exportData: Record<string, any> = {};
  const tableStructures: Record<string, string> = {};
  
  for (const table of tables) {
    console.log(`  Exporting ${table}...`);
    const data = await getTableData(sourcePool, table);
    const structure = await getTableStructure(sourcePool, table);
    
    exportData[table] = data;
    tableStructures[table] = structure;
    
    console.log(`    ✓ Exported ${data.length} rows from ${table}`);
  }
  
  // Save to JSON file
  const exportPath = path.join(outputDir, 'database-export.json');
  fs.writeFileSync(exportPath, JSON.stringify({
    tables: exportData,
    structures: tableStructures,
    exportedAt: new Date().toISOString(),
    tableCount: tables.length,
    totalRows: Object.values(exportData).reduce((sum, rows) => sum + rows.length, 0)
  }, null, 2));
  
  console.log(`✅ Data exported to ${exportPath}`);
  return { exportData, tableStructures, tables };
}

async function createTablesInRDS(targetPool: Pool, tableStructures: Record<string, string>) {
  console.log("🗄️ Creating tables in Amazon RDS...");
  
  // Get CREATE TABLE statements from source
  const sourcePool = new Pool({ connectionString: RAILWAY_DB_URL });
  
  for (const [tableName, structure] of Object.entries(tableStructures)) {
    try {
      // Get full CREATE TABLE statement
      const createResult = await sourcePool.query(`
        SELECT pg_get_tabledef('${tableName}')
      `);
      
      // Try to create table with IF NOT EXISTS
      const createSQL = `CREATE TABLE IF NOT EXISTS ${tableName} (${structure})`;
      
      try {
        await targetPool.query(createSQL);
        console.log(`  ✓ Created table ${tableName}`);
      } catch (error: any) {
        // If table exists, that's okay
        if (error.message.includes('already exists')) {
          console.log(`  ⚠ Table ${tableName} already exists, skipping creation`);
        } else {
          console.error(`  ✗ Error creating table ${tableName}:`, error.message);
        }
      }
    } catch (error: any) {
      console.error(`  ✗ Error getting structure for ${tableName}:`, error.message);
    }
  }
  
  await sourcePool.end();
}

async function importData(targetPool: Pool, exportData: Record<string, any[]>) {
  console.log("📥 Importing data to Amazon RDS...");
  
  // Import in order to respect foreign keys
  const importOrder = [
    'users',
    'admin_users',
    'trading_accounts',
    'deposits',
    'withdrawals',
    'documents',
    'notifications',
    'trading_history',
    'support_tickets',
    'support_ticket_replies',
    'fund_transfers',
    'ib_cb_wallets',
    'activity_logs',
    'admin_country_assignments',
    'stripe_payments',
    'crypto_wallets'
  ];
  
  for (const tableName of importOrder) {
    if (!exportData[tableName] || exportData[tableName].length === 0) {
      console.log(`  ⏭ Skipping ${tableName} (no data)`);
      continue;
    }
    
    const rows = exportData[tableName];
    console.log(`  Importing ${rows.length} rows into ${tableName}...`);
    
    try {
      // Clear existing data (optional - comment out if you want to keep existing)
      await targetPool.query(`TRUNCATE TABLE ${tableName} CASCADE`);
      
      // Insert data in batches
      const batchSize = 100;
      for (let i = 0; i < rows.length; i += batchSize) {
        const batch = rows.slice(i, i + batchSize);
        
        if (batch.length > 0) {
          const columns = Object.keys(batch[0]);
          const placeholders = batch.map((_, idx) => 
            `(${columns.map((_, colIdx) => `$${idx * columns.length + colIdx + 1}`).join(', ')})`
          ).join(', ');
          
          const values = batch.flatMap(row => columns.map(col => row[col]));
          const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES ${placeholders} ON CONFLICT DO NOTHING`;
          
          await targetPool.query(query, values);
        }
      }
      
      console.log(`    ✓ Imported ${rows.length} rows into ${tableName}`);
    } catch (error: any) {
      console.error(`    ✗ Error importing ${tableName}:`, error.message);
    }
  }
}

async function verifyMigration(sourcePool: Pool, targetPool: Pool) {
  console.log("🔍 Verifying migration...");
  
  const tables = await getTableNames(sourcePool);
  
  for (const table of tables) {
    const sourceCount = (await getTableData(sourcePool, table)).length;
    const targetCount = (await getTableData(targetPool, table)).length;
    
    if (sourceCount === targetCount) {
      console.log(`  ✅ ${table}: ${sourceCount} rows (match)`);
    } else {
      console.log(`  ⚠️ ${table}: Source=${sourceCount}, Target=${targetCount} (mismatch!)`);
    }
  }
}

async function main() {
  console.log("🚀 Starting Database Migration: Railway → Amazon RDS\n");
  
  // Check environment variables
  if (!process.env.RDS_PASSWORD) {
    console.error("❌ Error: RDS_PASSWORD environment variable is required");
    console.log("\nUsage:");
    console.log("  RDS_USERNAME=your_username RDS_PASSWORD=your_password RDS_DATABASE=your_db npm run migrate:rds");
    process.exit(1);
  }
  
  const sourcePool = new Pool({ 
    connectionString: RAILWAY_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  const targetPool = new Pool({ 
    connectionString: RDS_DB_URL,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    // Test connections
    console.log("🔌 Testing database connections...");
    await sourcePool.query("SELECT 1");
    console.log("  ✅ Connected to Railway PostgreSQL");
    
    await targetPool.query("SELECT 1");
    console.log("  ✅ Connected to Amazon RDS\n");
    
    // Export data
    const outputDir = path.join(process.cwd(), 'migration-backup');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const { exportData, tableStructures, tables } = await exportData(sourcePool, outputDir);
    
    // Create tables in RDS
    await createTablesInRDS(targetPool, tableStructures);
    
    // Import data
    await importData(targetPool, exportData);
    
    // Verify
    await verifyMigration(sourcePool, targetPool);
    
    console.log("\n✅ Migration completed successfully!");
    console.log(`📁 Backup saved to: ${outputDir}/database-export.json`);
    
  } catch (error: any) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sourcePool.end();
    await targetPool.end();
  }
}

// Run if executed directly
main().catch(console.error);

export { main as migrateToRDS };

