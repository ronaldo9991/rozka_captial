// Runtime SQL migrations for database initialization
// This creates all necessary tables without requiring drizzle-kit

import Database from 'better-sqlite3';

export function createTables(db: Database.Database) {
  console.log('🗄️ Creating database tables...');

  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
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
      verified INTEGER DEFAULT 0,
      enabled INTEGER DEFAULT 1,
      next_of_kin_name TEXT,
      next_of_kin_file TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Admin Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      created_by TEXT
    )
  `);

  // Trading Accounts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trading_accounts (
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
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Deposits table
  db.exec(`
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      merchant TEXT NOT NULL,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      transaction_id TEXT,
      verification_file TEXT,
      deposit_date INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      completed_at INTEGER
    )
  `);

  // Withdrawals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS withdrawals (
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
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      processed_at INTEGER
    )
  `);

  // Trading History table
  db.exec(`
    CREATE TABLE IF NOT EXISTS trading_history (
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
      open_time INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      close_time INTEGER
    )
  `);

  // Documents table
  db.exec(`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      rejection_reason TEXT,
      approved_by TEXT,
      uploaded_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      verified_at INTEGER
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL,
      "read" INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Admin Country Assignments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_country_assignments (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL REFERENCES admin_users(id),
      country TEXT NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Activity Logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT REFERENCES admin_users(id),
      user_id TEXT REFERENCES users(id),
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entity_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Support Tickets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id),
      admin_id TEXT REFERENCES admin_users(id),
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Open',
      priority TEXT DEFAULT 'Medium',
      category TEXT,
      attachments TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      resolved_at INTEGER
    )
  `);

  // Support Ticket Replies table
  db.exec(`
    CREATE TABLE IF NOT EXISTS support_ticket_replies (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES support_tickets(id),
      user_id TEXT REFERENCES users(id),
      admin_id TEXT REFERENCES admin_users(id),
      message TEXT NOT NULL,
      attachments TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Fund Transfers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fund_transfers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      from_account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      to_account_id TEXT NOT NULL REFERENCES trading_accounts(id),
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL DEFAULT 'Pending',
      notes TEXT,
      processed_by TEXT REFERENCES admin_users(id),
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      processed_at INTEGER
    )
  `);

  // IB CB Wallets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ib_cb_wallets (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      wallet_type TEXT NOT NULL,
      balance TEXT DEFAULT '0',
      currency TEXT DEFAULT 'USD',
      commission_rate TEXT DEFAULT '0',
      total_commission TEXT DEFAULT '0',
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Crypto Wallets table
  db.exec(`
  CREATE TABLE IF NOT EXISTS crypto_wallets (
    id TEXT PRIMARY KEY,
    crypto_type TEXT NOT NULL,
    network TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    qr_code_url TEXT,
    enabled INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
    updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
  )
  `);

  // Topup Cards table
  db.exec(`
    CREATE TABLE IF NOT EXISTS topup_cards (
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
      enabled INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      updated_at INTEGER DEFAULT (strftime('%s', 'now') * 1000)
    )
  `);

  // Stripe Payments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS stripe_payments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      deposit_id TEXT REFERENCES deposits(id),
      stripe_payment_intent_id TEXT NOT NULL UNIQUE,
      amount TEXT NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT NOT NULL,
      metadata TEXT,
      created_at INTEGER DEFAULT (strftime('%s', 'now') * 1000),
      completed_at INTEGER
    )
  `);

  console.log('✅ All database tables created successfully');
}

