/**
 * Safe MySQL Schema Fix - Checks before adding columns
 */

import mysql from 'mysql2/promise';

export async function fixMySQLSchemaSafe() {
  console.log('🔧 Fixing MySQL schema safely...');

  try {
    const databaseUrl = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
    if (!databaseUrl) {
      console.log('⚠️ DATABASE_URL not set');
      return;
    }

    const isMySQL = databaseUrl.startsWith('mysql://') || databaseUrl.startsWith('mariadb://');
    if (!isMySQL) {
      console.log('⚠️ Not a MySQL database');
      return;
    }

    const url = new URL(databaseUrl);
    const connection = await mysql.createConnection({
      host: url.hostname,
      port: parseInt(url.port || '3306'),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.slice(1),
    });

    console.log('✅ Connected to MySQL database');

    // Check and add columns to users table
    const usersColumns = [
      { name: 'username', type: 'VARCHAR(255) UNIQUE', after: 'id' },
      { name: 'email_verification_token', type: 'VARCHAR(255)', after: 'password_reset_expires' },
      { name: 'email_verification_expires', type: 'TIMESTAMP NULL', after: 'email_verification_token' },
      { name: 'email_verified', type: 'BOOLEAN DEFAULT false', after: 'email_verification_expires' },
      { name: 'next_of_kin_name', type: 'VARCHAR(255)', after: 'email_verified' },
      { name: 'next_of_kin_file', type: 'TEXT', after: 'next_of_kin_name' },
    ];

    for (const col of usersColumns) {
      try {
        // Check if column exists
        const [rows]: any = await connection.execute(
          `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users' AND COLUMN_NAME = ?`,
          [url.pathname.slice(1), col.name]
        );

        if (rows.length === 0) {
          // Column doesn't exist, add it
          const afterClause = col.after ? ` AFTER ${col.after}` : '';
          await connection.execute(
            `ALTER TABLE users ADD COLUMN ${col.name} ${col.type}${afterClause}`
          );
          console.log(`✅ Added column: users.${col.name}`);
        } else {
          console.log(`⚠️  Column already exists: users.${col.name}`);
        }
      } catch (error: any) {
        console.error(`❌ Error adding column users.${col.name}:`, error.message);
      }
    }

    // Fix documents table
    try {
      const [docRows]: any = await connection.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'documents' AND COLUMN_NAME = 'file_name'`,
        [url.pathname.slice(1)]
      );

      if (docRows.length === 0) {
        await connection.execute(
          `ALTER TABLE documents ADD COLUMN file_name VARCHAR(255) AFTER file_path`
        );
        console.log(`✅ Added column: documents.file_name`);
      } else {
        console.log(`⚠️  Column already exists: documents.file_name`);
      }
    } catch (error: any) {
      console.error(`❌ Error fixing documents table:`, error.message);
    }

    // Fix withdrawals table - check user_id type
    try {
      const [withdrawRows]: any = await connection.execute(
        `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'withdrawals' AND COLUMN_NAME = 'user_id'`,
        [url.pathname.slice(1)]
      );

      if (withdrawRows.length > 0) {
        const dataType = withdrawRows[0].DATA_TYPE;
        if (dataType === 'int' || dataType === 'bigint') {
          console.log(`⚠️  withdrawals.user_id is ${dataType}, should be VARCHAR(255)`);
          // Note: Changing column type might require data migration, be careful
          // For now, just log the issue
        } else {
          console.log(`✅ withdrawals.user_id type is correct: ${dataType}`);
        }
      } else {
        // Column doesn't exist at all
        await connection.execute(
          `ALTER TABLE withdrawals ADD COLUMN user_id VARCHAR(255) NOT NULL AFTER id`
        );
        console.log(`✅ Added column: withdrawals.user_id`);
      }
    } catch (error: any) {
      console.error(`❌ Error fixing withdrawals table:`, error.message);
    }

    await connection.end();
    console.log('✅ MySQL schema fixes completed');
  } catch (error: any) {
    console.error('❌ Error fixing MySQL schema:', error.message);
    throw error;
  }
}










