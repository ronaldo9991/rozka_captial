// PostgreSQL runtime migrations
// Creates all tables automatically if they don't exist

export async function createPostgresTables(pool: any) {
  console.log('🗄️ Creating PostgreSQL tables...');

  const queries = [
    // Users table
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT,
      phone TEXT,
      country TEXT,
      city TEXT,
      address TEXT,
      zip_code TEXT,
      referral_id TEXT UNIQUE,
      referred_by TEXT,
      referral_status TEXT DEFAULT 'Pending',
      verified BOOLEAN DEFAULT false,
      enabled BOOLEAN DEFAULT true,
      password_reset_token TEXT,
      password_reset_expires TIMESTAMP,
      email_verification_token TEXT,
      email_verification_expires TIMESTAMP,
      email_verified BOOLEAN DEFAULT false,
      next_of_kin_name TEXT,
      next_of_kin_file TEXT,
      mt5_live_login TEXT,
      mt5_live_password TEXT,
      mt5_demo_login TEXT,
      mt5_demo_password TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Admin Users table
    `CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      created_by TEXT
    )`,

    // Trading Accounts table
    `CREATE TABLE IF NOT EXISTS trading_accounts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_id TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      type TEXT NOT NULL,
      "group" TEXT NOT NULL,
      leverage TEXT NOT NULL,
      balance TEXT DEFAULT '0',
      equity TEXT DEFAULT '0',
      margin TEXT DEFAULT '0',
      free_margin TEXT DEFAULT '0',
      margin_level TEXT DEFAULT '0',
      currency TEXT DEFAULT 'USD',
      server TEXT DEFAULT 'Binofox-Live',
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Deposits table
    `CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      merchant TEXT NOT NULL,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      transaction_id TEXT,
      verification_file TEXT,
      deposit_date TIMESTAMP DEFAULT NOW(),
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    )`,

    // Withdrawals table
    `CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      method TEXT NOT NULL,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      bank_name TEXT,
      account_number TEXT,
      account_holder_name TEXT,
      swift_code TEXT,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP
    )`,

    // Trading History table
    `CREATE TABLE IF NOT EXISTS trading_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      ticket_id TEXT NOT NULL,
      symbol TEXT NOT NULL,
      type TEXT NOT NULL,
      volume TEXT NOT NULL,
      open_price TEXT NOT NULL,
      close_price TEXT,
      stop_loss TEXT,
      take_profit TEXT,
      profit TEXT,
      commission TEXT DEFAULT '0',
      swap TEXT DEFAULT '0',
      status TEXT NOT NULL,
      open_time TIMESTAMP DEFAULT NOW(),
      close_time TIMESTAMP
    )`,

    // Documents table
    `CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      approved_by TEXT,
      uploaded_at TIMESTAMP DEFAULT NOW(),
      verified_at TIMESTAMP
    )`,

    // Notifications table
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      "read" BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Admin Country Assignments table
    `CREATE TABLE IF NOT EXISTS admin_country_assignments (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admin_users(id),
      country TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Activity Logs table
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT REFERENCES admin_users(id),
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Support Tickets table
    `CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      admin_id TEXT REFERENCES admin_users(id),
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      category TEXT,
      attachments TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      resolved_at TIMESTAMP
    )`,

    // Support Ticket Replies table
    `CREATE TABLE IF NOT EXISTS support_ticket_replies (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES support_tickets(id),
      user_id TEXT REFERENCES users(id),
      admin_id TEXT REFERENCES admin_users(id),
      message TEXT NOT NULL,
      attachments TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )`,

    // Fund Transfers table
    `CREATE TABLE IF NOT EXISTS fund_transfers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      from_account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      to_account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      notes TEXT,
      processed_by TEXT REFERENCES admin_users(id),
      created_at TIMESTAMP DEFAULT NOW(),
      processed_at TIMESTAMP
    )`,

    // IB CB Wallets table
    `CREATE TABLE IF NOT EXISTS ib_cb_wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      wallet_type TEXT NOT NULL,
      balance TEXT DEFAULT '0',
      currency TEXT DEFAULT 'USD',
      commission_rate TEXT DEFAULT '0',
      total_commission TEXT DEFAULT '0',
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Crypto Wallets table
    `CREATE TABLE IF NOT EXISTS crypto_wallets (
      id TEXT PRIMARY KEY,
      crypto_type TEXT NOT NULL,
      network TEXT NOT NULL,
      wallet_address TEXT NOT NULL,
      qr_code_url TEXT,
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Topup Cards table (Credit cards created by super admin for users)
    `CREATE TABLE IF NOT EXISTS topup_cards (
      id TEXT PRIMARY KEY,
      card_number TEXT NOT NULL UNIQUE,
      card_holder_name TEXT NOT NULL,
      expiry_month TEXT NOT NULL,
      expiry_year TEXT NOT NULL,
      cvv TEXT NOT NULL,
      balance TEXT DEFAULT '0',
      currency TEXT DEFAULT 'USD',
      assigned_to_user_id TEXT REFERENCES users(id),
      created_by_admin_id TEXT NOT NULL REFERENCES admin_users(id),
      enabled BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )`,

    // Refresh Tokens table (for mobile app authentication)
    `CREATE TABLE IF NOT EXISTS refresh_tokens (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL UNIQUE,
      device_id TEXT,
      device_name TEXT,
      ip_address TEXT,
      user_agent TEXT,
      expires_at TIMESTAMP NOT NULL,
      revoked BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      last_used_at TIMESTAMP
    )`,

    // Indexes for refresh_tokens
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash)`,
    `CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)`,
  ];

  for (const query of queries) {
    try {
      await pool.query(query);
    } catch (error: any) {
      // Ignore "already exists" errors
      if (error?.code !== '42P07' && !error?.message?.includes('already exists')) {
        console.error('Error creating table:', error);
        throw error;
      }
    }
  }

  console.log('✅ All PostgreSQL tables created successfully');

  // Add missing columns to existing users table if they don't exist
  try {
    await pool.query(`
      DO $$ 
      BEGIN
        -- Add password_reset_token column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password_reset_token'
        ) THEN
          ALTER TABLE users ADD COLUMN password_reset_token TEXT;
          RAISE NOTICE 'Added password_reset_token column to users table';
        END IF;

        -- Add password_reset_expires column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'password_reset_expires'
        ) THEN
          ALTER TABLE users ADD COLUMN password_reset_expires TIMESTAMP;
          RAISE NOTICE 'Added password_reset_expires column to users table';
        END IF;

        -- Add email_verification_token column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'email_verification_token'
        ) THEN
          ALTER TABLE users ADD COLUMN email_verification_token TEXT;
          RAISE NOTICE 'Added email_verification_token column to users table';
        END IF;

        -- Add email_verification_expires column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'email_verification_expires'
        ) THEN
          ALTER TABLE users ADD COLUMN email_verification_expires TIMESTAMP;
          RAISE NOTICE 'Added email_verification_expires column to users table';
        END IF;

        -- Add email_verified column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'users' AND column_name = 'email_verified'
        ) THEN
          ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
          RAISE NOTICE 'Added email_verified column to users table';
        END IF;
      END $$;
    `);
    console.log('✅ Verified all user columns exist in users table');
  } catch (error: any) {
    // Log but don't fail - columns might already exist or migration might not be needed
    if (!error?.message?.includes('already exists') && !error?.message?.includes('duplicate')) {
      console.warn('⚠️ Warning: Could not verify password reset columns:', error.message);
    }
  }

  // Add missing columns to existing crypto_wallets table if they don't exist
  try {
    await pool.query(`
      DO $$ 
      BEGIN
        -- Add qr_code_url column if it doesn't exist
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'crypto_wallets' AND column_name = 'qr_code_url'
        ) THEN
          ALTER TABLE crypto_wallets ADD COLUMN qr_code_url TEXT;
          RAISE NOTICE 'Added qr_code_url column to crypto_wallets table';
        END IF;
      END $$;
    `);
    console.log('✅ Verified all columns exist in crypto_wallets table');
  } catch (error: any) {
    // Log but don't fail - columns might already exist or migration might not be needed
    if (!error?.message?.includes('already exists') && !error?.message?.includes('duplicate')) {
      console.warn('⚠️ Warning: Could not verify crypto_wallets columns:', error.message);
    }
  }
}

