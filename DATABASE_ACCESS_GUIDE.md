# 🗄️ Database Access Guide

This guide shows you how to access and query your Mekness database.

## Quick Check: Which Database Are You Using?

The application automatically detects your database type:
- **SQLite** (local development): If `DATABASE_URL` is not set or doesn't start with `postgresql://`
- **PostgreSQL** (production): If `DATABASE_URL` starts with `postgresql://` or `postgres://`

Check your database type by looking at server startup logs:
- `📁 Using SQLite database` = SQLite
- `🐘 Using PostgreSQL database` = PostgreSQL

---

## 📁 SQLite Database Access (Local Development)

### Location
The SQLite database file is located at:
```
d:\Project\Mekness Project\local.db
```

### Method 1: Using DB Browser for SQLite (Recommended - GUI)

1. **Download DB Browser for SQLite:**
   - Download from: https://sqlitebrowser.org/
   - Or via Chocolatey: `choco install sqlitebrowser`

2. **Open the database:**
   - Launch DB Browser for SQLite
   - Click "Open Database"
   - Navigate to: `d:\Project\Mekness Project\local.db`
   - Click "Open"

3. **Browse and query:**
   - Click "Browse Data" tab to view tables
   - Click "Execute SQL" tab to run queries
   - All tables are visible in the left sidebar

### Method 2: Using Command Line (sqlite3)

**Windows (PowerShell):**
```powershell
# Install sqlite3 (if not installed)
# Download from: https://www.sqlite.org/download.html
# Or use: choco install sqlite

# Connect to database
sqlite3 "d:\Project\Mekness Project\local.db"

# Once connected, you can run SQL queries:
.tables                    # List all tables
.schema users              # Show table structure
SELECT * FROM users;       # Query data
SELECT * FROM admin_users; # View admin users
.exit                      # Exit
```

**Example Queries:**
```sql
-- View all admin users
SELECT id, username, email, role, enabled FROM admin_users;

-- View all regular users
SELECT id, username, email, full_name, country, verified, enabled FROM users;

-- View trading accounts
SELECT * FROM trading_accounts LIMIT 10;

-- View deposits
SELECT * FROM deposits ORDER BY created_at DESC LIMIT 10;

-- View withdrawals
SELECT * FROM withdrawals ORDER BY created_at DESC LIMIT 10;
```

### Method 3: Using VS Code Extension

1. **Install SQLite Viewer extension:**
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "SQLite Viewer" or "SQLite"
   - Install one of the extensions

2. **Open database:**
   - Right-click `local.db` in VS Code
   - Select "Open Database" or "View Database"
   - Browse tables and run queries

### Method 4: Using Node.js Script

Create a file `query-db.js`:
```javascript
import Database from 'better-sqlite3';

const db = new Database('./local.db');

// Example: Get all admin users
const admins = db.prepare('SELECT * FROM admin_users').all();
console.log('Admin Users:', admins);

// Example: Get all users
const users = db.prepare('SELECT id, username, email FROM users LIMIT 10').all();
console.log('Users:', users);

db.close();
```

Run it:
```bash
node query-db.js
```

---

## 🐘 PostgreSQL Database Access (Production/Remote)

### Get Connection String

Your PostgreSQL connection string is stored in:
- Environment variable: `DATABASE_URL`
- Or: `DATABASE_PUBLIC_URL` (for Railway)

**Format:**
```
postgresql://username:password@host:port/database
```

### Method 1: Using psql (Command Line)

**Windows:**
```powershell
# Install PostgreSQL client (if not installed)
# Download from: https://www.postgresql.org/download/windows/
# Or use: choco install postgresql

# Connect using connection string
psql "postgresql://username:password@host:port/database"

# Or set environment variable first
$env:DATABASE_URL="postgresql://username:password@host:port/database"
psql $env:DATABASE_URL
```

**Once connected:**
```sql
-- List all tables
\dt

-- Describe a table
\d users
\d admin_users

-- Query data
SELECT * FROM users LIMIT 10;
SELECT * FROM admin_users;

-- Exit
\q
```

### Method 2: Using pgAdmin (GUI - Recommended)

1. **Download pgAdmin:**
   - Download from: https://www.pgadmin.org/download/
   - Or via Chocolatey: `choco install pgadmin4`

2. **Add Server:**
   - Open pgAdmin
   - Right-click "Servers" → "Create" → "Server"
   - **General tab:**
     - Name: `Mekness Database`
   - **Connection tab:**
     - Host: Extract from `DATABASE_URL` (e.g., `shuttle.proxy.rlwy.net`)
     - Port: Extract from `DATABASE_URL` (e.g., `23811`)
     - Database: Extract from `DATABASE_URL` (e.g., `railway`)
     - Username: Extract from `DATABASE_URL` (e.g., `postgres`)
     - Password: Extract from `DATABASE_URL`
     - Save password: ✓
   - **SSL tab (if using Railway):**
     - SSL mode: `Require`
   - Click "Save"

3. **Browse and query:**
   - Expand your server → Databases → `railway` → Schemas → `public` → Tables
   - Right-click any table → "View/Edit Data" → "All Rows"
   - Use Query Tool to run SQL queries

### Method 3: Using DBeaver (Universal Database Tool)

1. **Download DBeaver:**
   - Download from: https://dbeaver.io/download/
   - Works with both SQLite and PostgreSQL

2. **For PostgreSQL:**
   - New Database Connection → PostgreSQL
   - Enter connection details from `DATABASE_URL`
   - Test Connection → Finish

3. **For SQLite:**
   - New Database Connection → SQLite
   - Path: `d:\Project\Mekness Project\local.db`
   - Test Connection → Finish

### Method 4: Using Railway CLI (If using Railway)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Connect to database
railway connect postgres
```

### Method 5: Using Node.js Script

Create a file `query-postgres.js`:
```javascript
import pg from 'pg';
const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || process.env.DATABASE_PUBLIC_URL;
const pool = new Pool({ connectionString });

// Example: Get all admin users
const result = await pool.query('SELECT * FROM admin_users');
console.log('Admin Users:', result.rows);

// Example: Get all users
const users = await pool.query('SELECT id, username, email FROM users LIMIT 10');
console.log('Users:', users.rows);

await pool.end();
```

Run it:
```bash
# Set DATABASE_URL first
$env:DATABASE_URL="postgresql://username:password@host:port/database"
node query-postgres.js
```

---

## 🔍 Common Database Queries

### View Admin Users
```sql
SELECT 
  id, 
  username, 
  email, 
  full_name, 
  role, 
  enabled,
  created_at
FROM admin_users
ORDER BY created_at DESC;
```

### View All Users
```sql
SELECT 
  id, 
  username, 
  email, 
  full_name, 
  country, 
  verified, 
  enabled,
  created_at
FROM users
ORDER BY created_at DESC
LIMIT 50;
```

### View Trading Accounts
```sql
SELECT 
  ta.id,
  ta.account_id,
  ta.type,
  ta.balance,
  ta.equity,
  ta.enabled,
  u.username,
  u.email
FROM trading_accounts ta
JOIN users u ON ta.user_id = u.id
ORDER BY ta.created_at DESC
LIMIT 20;
```

### View Deposits
```sql
SELECT 
  d.id,
  d.amount,
  d.currency,
  d.status,
  d.created_at,
  u.username,
  u.email
FROM deposits d
JOIN users u ON d.user_id = u.id
ORDER BY d.created_at DESC
LIMIT 20;
```

### View Withdrawals
```sql
SELECT 
  w.id,
  w.amount,
  w.currency,
  w.status,
  w.created_at,
  u.username,
  u.email
FROM withdrawals w
JOIN users u ON w.user_id = u.id
ORDER BY w.created_at DESC
LIMIT 20;
```

### Count Statistics
```sql
-- Total users
SELECT COUNT(*) as total_users FROM users;

-- Verified users
SELECT COUNT(*) as verified_users FROM users WHERE verified = true;

-- Total admin users
SELECT COUNT(*) as total_admins FROM admin_users;

-- Enabled admin users
SELECT COUNT(*) as enabled_admins FROM admin_users WHERE enabled = true;

-- Pending deposits
SELECT COUNT(*) as pending_deposits FROM deposits WHERE status = 'Pending';

-- Pending withdrawals
SELECT COUNT(*) as pending_withdrawals FROM withdrawals WHERE status = 'Pending';
```

---

## 🛠️ Database Management Commands

### Backup Database

**SQLite:**
```powershell
# Copy the database file
Copy-Item "local.db" "local.db.backup"
```

**PostgreSQL:**
```bash
# Using pg_dump
pg_dump "postgresql://username:password@host:port/database" > backup.sql

# Or using Railway CLI
railway run pg_dump > backup.sql
```

### Restore Database

**SQLite:**
```powershell
# Replace database file
Copy-Item "local.db.backup" "local.db"
```

**PostgreSQL:**
```bash
# Using psql
psql "postgresql://username:password@host:port/database" < backup.sql
```

### Reset Database (⚠️ DANGER - Deletes all data)

**SQLite:**
```powershell
# Delete database file
Remove-Item "local.db"
# Restart server - it will recreate the database
```

**PostgreSQL:**
```sql
-- Connect to database
-- Drop all tables (be very careful!)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
-- Then restart server to recreate tables
```

---

## 📝 Quick Reference

### Find Your Database Connection Info

**Check environment variables:**
```powershell
# Windows PowerShell
$env:DATABASE_URL
$env:DATABASE_PUBLIC_URL

# Or check .env file
Get-Content .env | Select-String "DATABASE"
```

**Check server logs:**
When you start the server, it will log:
- Database type (SQLite or PostgreSQL)
- Database path (for SQLite)
- Connection string (masked, for PostgreSQL)

---

## 🆘 Troubleshooting

### "Database not found" (SQLite)
- Check if `local.db` exists in project root
- If missing, restart server - it will create the database

### "Connection refused" (PostgreSQL)
- Verify `DATABASE_URL` is correct
- Check if database server is running
- Verify network/firewall settings
- For Railway: Use `DATABASE_PUBLIC_URL` for external access

### "Permission denied"
- Check database user permissions
- Verify username and password in connection string

### "Table does not exist"
- Run migrations: `npm run db:push`
- Or restart server (auto-creates tables)

---

## 💡 Recommended Tools

1. **SQLite:** DB Browser for SQLite (https://sqlitebrowser.org/)
2. **PostgreSQL:** pgAdmin (https://www.pgadmin.org/)
3. **Both:** DBeaver (https://dbeaver.io/)
4. **VS Code:** SQLite Viewer extension

---

Need help? Check the server logs for database connection details!
