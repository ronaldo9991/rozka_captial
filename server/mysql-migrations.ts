// MySQL/MariaDB runtime migrations
// Creates all tables automatically if they don't exist

export async function createMySQLTables(pool: any) {
  console.log('🗄️ Creating MySQL/MariaDB tables...');

  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255),
      phone VARCHAR(255),
      country VARCHAR(255),
      city VARCHAR(255),
      address TEXT,
      zip_code VARCHAR(255),
      referral_id VARCHAR(255) UNIQUE,
      referred_by VARCHAR(255),
      referral_status VARCHAR(255) DEFAULT 'Pending',
      verified BOOLEAN DEFAULT false,
      enabled BOOLEAN DEFAULT true,
      password_reset_token VARCHAR(255),
      password_reset_expires TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Admin Users table
    `CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(255) PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255) NOT NULL,
      role VARCHAR(255) NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by VARCHAR(255)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Trading Accounts table
    `CREATE TABLE IF NOT EXISTS trading_accounts (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      \`group\` VARCHAR(255) NOT NULL,
      leverage VARCHAR(255) NOT NULL,
      balance VARCHAR(255) DEFAULT '0',
      equity VARCHAR(255) DEFAULT '0',
      margin VARCHAR(255) DEFAULT '0',
      free_margin VARCHAR(255) DEFAULT '0',
      margin_level VARCHAR(255) DEFAULT '0',
      currency VARCHAR(255) DEFAULT 'USD',
      server VARCHAR(255) DEFAULT 'Binofox-Live',
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Deposits table
    `CREATE TABLE IF NOT EXISTS deposits (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id VARCHAR(255) NOT NULL,
      merchant VARCHAR(255) NOT NULL,
      amount VARCHAR(255) NOT NULL,
      currency VARCHAR(255) DEFAULT 'USD',
      status VARCHAR(255) NOT NULL DEFAULT 'Pending',
      transaction_id VARCHAR(255),
      verification_file TEXT,
      deposit_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Withdrawals table
    `CREATE TABLE IF NOT EXISTS withdrawals (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id VARCHAR(255) NOT NULL,
      amount VARCHAR(255) NOT NULL,
      currency VARCHAR(255) DEFAULT 'USD',
      status VARCHAR(255) NOT NULL DEFAULT 'Pending',
      payment_method VARCHAR(255),
      account_details TEXT,
      transaction_id VARCHAR(255),
      requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      completed_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Trading History table
    `CREATE TABLE IF NOT EXISTS trading_history (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id VARCHAR(255) NOT NULL,
      symbol VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      volume VARCHAR(255) NOT NULL,
      open_price VARCHAR(255) NOT NULL,
      close_price VARCHAR(255),
      profit VARCHAR(255),
      swap VARCHAR(255),
      commission VARCHAR(255),
      open_time TIMESTAMP NOT NULL,
      close_time TIMESTAMP NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Documents table
    `CREATE TABLE IF NOT EXISTS documents (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      type VARCHAR(255) NOT NULL,
      file_path TEXT NOT NULL,
      status VARCHAR(255) NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      verified_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(255) DEFAULT 'info',
      \`read\` BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Admin Country Assignments table
    `CREATE TABLE IF NOT EXISTS admin_country_assignments (
      id VARCHAR(255) PRIMARY KEY,
      admin_id VARCHAR(255) NOT NULL,
      country VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE,
      UNIQUE KEY unique_admin_country (admin_id, country)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Activity Logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id VARCHAR(255) PRIMARY KEY,
      admin_id VARCHAR(255),
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(255),
      entity_id VARCHAR(255),
      details TEXT,
      ip_address VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Support Tickets table
    `CREATE TABLE IF NOT EXISTS support_tickets (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      category VARCHAR(255),
      priority VARCHAR(255) DEFAULT 'Medium',
      status VARCHAR(255) DEFAULT 'Open',
      assigned_to VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Support Ticket Replies table
    `CREATE TABLE IF NOT EXISTS support_ticket_replies (
      id VARCHAR(255) PRIMARY KEY,
      ticket_id VARCHAR(255) NOT NULL,
      user_id VARCHAR(255),
      admin_id VARCHAR(255),
      message TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Fund Transfers table
    `CREATE TABLE IF NOT EXISTS fund_transfers (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      from_account_id VARCHAR(255) NOT NULL,
      to_account_id VARCHAR(255) NOT NULL,
      amount VARCHAR(255) NOT NULL,
      currency VARCHAR(255) DEFAULT 'USD',
      status VARCHAR(255) DEFAULT 'Pending',
      notes TEXT,
      processed_by VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_at TIMESTAMP NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (from_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE,
      FOREIGN KEY (to_account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // IB CB Wallets table
    `CREATE TABLE IF NOT EXISTS ib_cb_wallets (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      wallet_address VARCHAR(255) NOT NULL,
      wallet_type VARCHAR(255) NOT NULL,
      balance VARCHAR(255) DEFAULT '0',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Topup Cards table
    `CREATE TABLE IF NOT EXISTS topup_cards (
      id VARCHAR(255) PRIMARY KEY,
      card_number VARCHAR(19) NOT NULL UNIQUE,
      card_holder_name VARCHAR(255) NOT NULL,
      expiry_month VARCHAR(2) NOT NULL,
      expiry_year VARCHAR(4) NOT NULL,
      cvv VARCHAR(255) NOT NULL,
      balance VARCHAR(255) DEFAULT '0',
      currency VARCHAR(10) DEFAULT 'USD',
      assigned_to_user_id VARCHAR(255),
      created_by_admin_id VARCHAR(255) NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      account_id VARCHAR(255) NOT NULL,
      payment_intent_id VARCHAR(255) NOT NULL UNIQUE,
      amount VARCHAR(255) NOT NULL,
      currency VARCHAR(255) DEFAULT 'USD',
      status VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES trading_accounts(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Crypto Wallets table
    `CREATE TABLE IF NOT EXISTS crypto_wallets (
      id VARCHAR(255) PRIMARY KEY,
      user_id VARCHAR(255) NOT NULL,
      currency VARCHAR(255) NOT NULL,
      address VARCHAR(255) NOT NULL,
      private_key TEXT,
      balance VARCHAR(255) DEFAULT '0',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // Topup Cards table
    `CREATE TABLE IF NOT EXISTS topup_cards (
      id VARCHAR(255) PRIMARY KEY,
      card_number VARCHAR(19) NOT NULL UNIQUE,
      card_holder_name VARCHAR(255) NOT NULL,
      expiry_month VARCHAR(2) NOT NULL,
      expiry_year VARCHAR(4) NOT NULL,
      cvv VARCHAR(255) NOT NULL,
      balance VARCHAR(255) DEFAULT '0',
      currency VARCHAR(10) DEFAULT 'USD',
      assigned_to_user_id VARCHAR(255),
      created_by_admin_id VARCHAR(255) NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to_user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE RESTRICT
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

    // User Sessions table (for session store)
    `CREATE TABLE IF NOT EXISTS user_sessions (
      sid VARCHAR(255) PRIMARY KEY,
      sess TEXT NOT NULL,
      expire TIMESTAMP NOT NULL,
      INDEX idx_expire (expire)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  ];

  for (const query of queries) {
    try {
      await pool.execute(query);
    } catch (error: any) {
      console.error(`❌ Error creating table: ${error.message}`);
      console.error(`   Query: ${query.substring(0, 100)}...`);
      // Continue with other tables even if one fails
    }
  }

  // Add missing columns to existing tables
  console.log('🔧 Checking and adding missing columns...');
  
  const columnFixes = [
    // Users table - add username if missing
    {
      table: 'users',
      column: 'username',
      definition: 'VARCHAR(255) UNIQUE',
      after: 'id',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'username'`
    },
    // Users table - add email verification columns
    {
      table: 'users',
      column: 'email_verification_token',
      definition: 'VARCHAR(255)',
      after: 'password_reset_expires',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_token'`
    },
    {
      table: 'users',
      column: 'email_verification_expires',
      definition: 'TIMESTAMP NULL',
      after: 'email_verification_token',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verification_expires'`
    },
    {
      table: 'users',
      column: 'email_verified',
      definition: 'BOOLEAN DEFAULT false',
      after: 'email_verification_expires',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'email_verified'`
    },
    {
      table: 'users',
      column: 'next_of_kin_name',
      definition: 'VARCHAR(255)',
      after: 'email_verified',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'next_of_kin_name'`
    },
    {
      table: 'users',
      column: 'next_of_kin_file',
      definition: 'TEXT',
      after: 'next_of_kin_name',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'next_of_kin_file'`
    },
    // Documents table - add file_name
    {
      table: 'documents',
      column: 'file_name',
      definition: 'VARCHAR(255)',
      after: 'file_path',
      checkQuery: `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
                   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'documents' AND COLUMN_NAME = 'file_name'`
    },
  ];

  for (const fix of columnFixes) {
    try {
      // Check if column exists
      const [rows]: any = await pool.execute(fix.checkQuery);
      
      if (rows.length === 0) {
        // Column doesn't exist, add it
        const afterClause = fix.after ? ` AFTER ${fix.after}` : '';
        const alterQuery = `ALTER TABLE ${fix.table} ADD COLUMN ${fix.column} ${fix.definition}${afterClause}`;
        await pool.execute(alterQuery);
        console.log(`✅ Added missing column: ${fix.table}.${fix.column}`);
      } else {
        console.log(`⚠️  Column already exists: ${fix.table}.${fix.column}`);
      }
    } catch (error: any) {
      // Ignore if table doesn't exist (will be created by CREATE TABLE)
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log(`⚠️  Table ${fix.table} doesn't exist yet, will be created`);
      } else {
        console.error(`❌ Error checking/adding column ${fix.table}.${fix.column}:`, error.message);
      }
    }
  }

  // Fix withdrawals table - ensure user_id is VARCHAR, not INT
  try {
    const [withdrawCheck]: any = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'withdrawals' AND COLUMN_NAME = 'user_id'`
    );

    if (withdrawCheck.length > 0) {
      const dataType = withdrawCheck[0].DATA_TYPE;
      if (dataType === 'int' || dataType === 'bigint') {
        console.log(`⚠️  withdrawals.user_id is ${dataType}, should be VARCHAR(255) - manual fix may be needed`);
        // Note: Changing column type requires data migration, so we'll just warn
      }
    } else {
      // Column doesn't exist, add it
      await pool.execute(
        `ALTER TABLE withdrawals ADD COLUMN user_id VARCHAR(255) NOT NULL AFTER id`
      );
      console.log(`✅ Added missing column: withdrawals.user_id`);
    }
  } catch (error: any) {
    if (error.code !== 'ER_NO_SUCH_TABLE') {
      console.error(`❌ Error fixing withdrawals.user_id:`, error.message);
    }
  }

  console.log('✅ MySQL/MariaDB tables created and schema fixed successfully');
}

