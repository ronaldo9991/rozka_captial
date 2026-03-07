# Backend Setup Guide

This guide will help you set up the backend database and get it running.

## Quick Setup Steps

### Option 1: Using Neon (Recommended - Free & Easy)

1. **Sign up for Neon** (Free tier available):
   - Go to https://neon.tech
   - Sign up with GitHub/Google/Email
   - Create a new project
   - Copy the connection string (it looks like: `postgresql://user:password@host/dbname?sslmode=require`)

2. **Create .env file**:
   ```powershell
   # In PowerShell, run:
   cd MeknessDashboard
   @"
   DATABASE_URL=your-neon-connection-string-here
   SESSION_SECRET=your-random-secret-key-here
   PORT=5000
   NODE_ENV=development
   "@ | Out-File -FilePath .env -Encoding utf8
   ```
   
   Replace `your-neon-connection-string-here` with your actual Neon connection string.
   Replace `your-random-secret-key-here` with a random string (you can generate one with: `-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})`)

3. **Create database tables**:
   ```bash
   npm run db:push
   ```

4. **Restart the server**:
   ```bash
   npm run dev
   ```

### Option 2: Using Local PostgreSQL

1. **Install PostgreSQL**:
   - Download from https://www.postgresql.org/download/windows/
   - Install and remember your password

2. **Create database**:
   ```sql
   createdb mekness_db
   ```

3. **Create .env file**:
   ```powershell
   @"
   DATABASE_URL=postgresql://postgres:your-password@localhost:5432/mekness_db
   SESSION_SECRET=your-random-secret-key-here
   PORT=5000
   NODE_ENV=development
   "@ | Out-File -FilePath .env -Encoding utf8
   ```

4. **Create database tables**:
   ```bash
   npm run db:push
   ```

## Database Schema

The backend creates the following tables:

- **users** - User accounts and profiles
- **trading_accounts** - Trading accounts (Live, Demo, Bonus)
- **deposits** - Deposit transactions
- **withdrawals** - Withdrawal requests
- **trading_history** - Trading transaction history
- **documents** - User uploaded documents (ID, address proof, etc.)
- **notifications** - User notifications
- **admin_users** - Admin user accounts (super_admin, middle_admin, normal_admin)
- **admin_country_assignments** - Country assignments for middle admins
- **activity_logs** - Admin activity audit logs

## Testing the Backend

Once set up, you can test the API endpoints:

- `GET http://localhost:5000/api/auth/me` - Check authentication
- `POST http://localhost:5000/api/auth/signup` - Create a new user
- `POST http://localhost:5000/api/auth/signin` - Sign in

## Troubleshooting

### Database Connection Error
- Verify your `DATABASE_URL` is correct
- For Neon: Make sure SSL mode is enabled (`?sslmode=require`)
- Check that your database is accessible (firewall/network)

### Migration Errors
- Make sure the database exists
- Check that you have proper permissions
- Verify the connection string format

### Session Errors
- Ensure `SESSION_SECRET` is set in `.env`
- Restart the server after changing `.env`

