#!/usr/bin/env node

/**
 * Fix Database Schema - Add missing username column
 */

import mysql from 'mysql2/promise';

const databaseUrl = process.env.DATABASE_URL || 'mysql://cabinet:%289%3A!eg%23-7Nd1@localhost:3306/cabinet';

async function fixSchema() {
  console.log('🔧 Fixing database schema...\n');

  try {
    const url = new URL(databaseUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
    });

    console.log('✅ Connected to database:', url.pathname.slice(1));

    // Check current users table structure
    const [columns] = await connection.execute(
      `SHOW COLUMNS FROM users`
    );

    console.log('\n📋 Current users table columns:');
    columns.forEach((col) => {
      console.log(`   - ${col.Field} (${col.Type})`);
    });

    // Check if username exists
    const hasUsername = columns.some((col) => col.Field === 'username');
    
    if (!hasUsername) {
      console.log('\n❌ username column is missing!');
      console.log('🔧 Adding username column...');
      
      // Add username column after id
      await connection.execute(
        `ALTER TABLE users ADD COLUMN username VARCHAR(255) UNIQUE AFTER id`
      );
      
      console.log('✅ Added username column');
      
      // Populate username for existing users (use email prefix + random number)
      const [existingUsers] = await connection.execute(
        `SELECT id, email FROM users WHERE username IS NULL OR username = ''`
      );
      
      if (existingUsers.length > 0) {
        console.log(`\n📝 Updating ${existingUsers.length} existing users with usernames...`);
        for (const user of existingUsers) {
          const emailPrefix = user.email.split('@')[0];
          const randomSuffix = Math.floor(Math.random() * 10000);
          const username = `${emailPrefix}${randomSuffix}`;
          
          // Ensure uniqueness
          let finalUsername = username;
          let counter = 1;
          while (true) {
            const [check] = await connection.execute(
              `SELECT id FROM users WHERE username = ?`,
              [finalUsername]
            );
            if (check.length === 0) break;
            finalUsername = `${emailPrefix}${randomSuffix}${counter}`;
            counter++;
          }
          
          await connection.execute(
            `UPDATE users SET username = ? WHERE id = ?`,
            [finalUsername, user.id]
          );
        }
        console.log('✅ Updated existing users with usernames');
      }
    } else {
      console.log('\n✅ username column already exists');
    }

    // Check and add other missing columns that the code expects
    const missingColumns = [
      { name: 'full_name', type: 'VARCHAR(255)', after: 'username' },
      { name: 'zip_code', type: 'VARCHAR(255)', after: 'address' },
      { name: 'referral_id', type: 'VARCHAR(255) UNIQUE', after: 'zip_code' },
      { name: 'referred_by', type: 'VARCHAR(255)', after: 'referral_id' },
      { name: 'referral_status', type: 'VARCHAR(255) DEFAULT "Pending"', after: 'referred_by' },
      { name: 'verified', type: 'BOOLEAN DEFAULT false', after: 'referral_status' },
      { name: 'enabled', type: 'BOOLEAN DEFAULT true', after: 'verified' },
      { name: 'password_reset_token', type: 'VARCHAR(255)', after: 'enabled' },
      { name: 'password_reset_expires', type: 'TIMESTAMP NULL', after: 'password_reset_token' },
      { name: 'email_verification_token', type: 'VARCHAR(255)', after: 'password_reset_expires' },
      { name: 'email_verification_expires', type: 'TIMESTAMP NULL', after: 'email_verification_token' },
    ];

    // Get updated column list
    let currentColumns = columns;
    
    for (const col of missingColumns) {
      const exists = currentColumns.some((c) => c.Field === col.name);
      if (!exists) {
        console.log(`\n🔧 Adding missing column: ${col.name}...`);
        try {
          const afterClause = col.after ? ` AFTER ${col.after}` : '';
          await connection.execute(
            `ALTER TABLE users ADD COLUMN ${col.name} ${col.type}${afterClause}`
          );
          console.log(`✅ Added column: ${col.name}`);
          
          // Refresh column list
          const [updatedColumns] = await connection.execute(`SHOW COLUMNS FROM users`);
          currentColumns = updatedColumns;
        } catch (err) {
          // If "after" column doesn't exist, try without it
          if (err.code === 'ER_BAD_FIELD_ERROR' && col.after) {
            console.log(`   ⚠️  Column ${col.after} not found, adding at end...`);
            await connection.execute(
              `ALTER TABLE users ADD COLUMN ${col.name} ${col.type}`
            );
            console.log(`✅ Added column: ${col.name} (at end)`);
            const [updatedColumns] = await connection.execute(`SHOW COLUMNS FROM users`);
            currentColumns = updatedColumns;
          } else {
            console.error(`❌ Error adding ${col.name}:`, err.message);
          }
        }
      } else {
        console.log(`⚠️  Column already exists: ${col.name}`);
      }
    }

    // Fix documents table
    try {
      const [docColumns] = await connection.execute(`SHOW COLUMNS FROM documents`);
      const hasFileName = docColumns.some((col) => col.Field === 'file_name');
      if (!hasFileName) {
        console.log('\n🔧 Adding file_name to documents table...');
        await connection.execute(
          `ALTER TABLE documents ADD COLUMN file_name VARCHAR(255) AFTER file_path`
        );
        console.log('✅ Added file_name column to documents');
      }
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('⚠️  Error checking documents table:', error.message);
      }
    }

    // Fix withdrawals table
    try {
      const [withdrawColumns] = await connection.execute(`SHOW COLUMNS FROM withdrawals`);
      const hasUserId = withdrawColumns.some((col) => col.Field === 'user_id');
      if (!hasUserId) {
        console.log('\n🔧 Adding user_id to withdrawals table...');
        await connection.execute(
          `ALTER TABLE withdrawals ADD COLUMN user_id VARCHAR(255) NOT NULL AFTER id`
        );
        console.log('✅ Added user_id column to withdrawals');
      } else {
        const userIdCol = withdrawColumns.find((col) => col.Field === 'user_id');
        if (userIdCol && (userIdCol.Type.includes('int') || userIdCol.Type.includes('INT'))) {
          console.log('\n⚠️  withdrawals.user_id is INT, should be VARCHAR(255)');
          console.log('   Manual migration may be needed to change type');
        }
      }
    } catch (error) {
      if (error.code !== 'ER_NO_SUCH_TABLE') {
        console.error('⚠️  Error checking withdrawals table:', error.message);
      }
    }

    // Fix INT foreign key columns to VARCHAR(255)
    console.log('\n🔧 Fixing INT foreign key columns to VARCHAR(255)...');
    
    const tablesToFix = [
      { table: 'deposits', columns: ['user_id', 'account_id'] },
      { table: 'withdrawals', columns: ['user_id', 'account_id'] },
      { table: 'trading_history', columns: ['user_id', 'account_id'] },
      { table: 'documents', columns: ['user_id'] },
      { table: 'notifications', columns: ['user_id'] },
      { table: 'support_tickets', columns: ['user_id'] },
      { table: 'support_ticket_replies', columns: ['user_id'] },
      { table: 'fund_transfers', columns: ['user_id', 'from_account_id', 'to_account_id'] },
      { table: 'ib_cb_wallets', columns: ['user_id'] },
      { table: 'stripe_payments', columns: ['user_id', 'account_id'] },
      { table: 'crypto_wallets', columns: ['user_id'] },
      { table: 'activity_logs', columns: ['user_id'] },
    ];

    for (const { table, columns } of tablesToFix) {
      try {
        // Check if table exists
        const [tableCheck] = await connection.execute(
          `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
          [table]
        );
        
        if (tableCheck[0].count === 0) {
          console.log(`   ⚠️  Table ${table} does not exist, skipping...`);
          continue;
        }

        // Get current column types
        const [tableColumns] = await connection.execute(`SHOW COLUMNS FROM ${table}`);
        
        for (const colName of columns) {
          const col = tableColumns.find((c) => c.Field === colName);
          if (!col) {
            console.log(`   ⚠️  Column ${table}.${colName} does not exist, skipping...`);
            continue;
          }
          
          // Check if it's INT
          if (col.Type.includes('int') || col.Type.includes('INT')) {
            console.log(`   🔧 Changing ${table}.${colName} from ${col.Type} to VARCHAR(255)...`);
            
            // Drop foreign key constraint if exists
            try {
              const [fks] = await connection.execute(
                `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE 
                 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? 
                 AND REFERENCED_TABLE_NAME IS NOT NULL`,
                [table, colName]
              );
              
              for (const fk of fks) {
                console.log(`      Dropping foreign key: ${fk.CONSTRAINT_NAME}`);
                await connection.execute(
                  `ALTER TABLE ${table} DROP FOREIGN KEY ${fk.CONSTRAINT_NAME}`
                );
              }
            } catch (fkError) {
              // Foreign key might not exist, continue
            }
            
            // Change column type
            await connection.execute(
              `ALTER TABLE ${table} MODIFY COLUMN ${colName} VARCHAR(255) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`
            );
            
            console.log(`   ✅ Changed ${table}.${colName} to VARCHAR(255)`);
            
            // Re-add foreign key constraint
            if (colName === 'user_id') {
              try {
                await connection.execute(
                  `ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_user_id 
                   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE`
                );
              } catch (fkError) {
                // Constraint might already exist or fail, continue
              }
            } else if (colName === 'account_id' || colName === 'from_account_id' || colName === 'to_account_id') {
              try {
                await connection.execute(
                  `ALTER TABLE ${table} ADD CONSTRAINT fk_${table}_${colName} 
                   FOREIGN KEY (${colName}) REFERENCES trading_accounts(id) ON DELETE CASCADE`
                );
              } catch (fkError) {
                // Constraint might already exist or fail, continue
              }
            }
          } else {
            console.log(`   ✅ ${table}.${colName} is already ${col.Type}`);
          }
        }
      } catch (error) {
        console.error(`   ❌ Error fixing ${table}:`, error.message);
      }
    }

    await connection.end();
    console.log('\n✅ Database schema fix completed!');
  } catch (error) {
    console.error('\n❌ Error fixing schema:', error.message);
    console.error('   Code:', error.code);
    process.exit(1);
  }
}

fixSchema();

