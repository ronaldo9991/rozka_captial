# Complete Database Migration: Railway → AWS RDS

## Prerequisites

1. **AWS RDS Instance Created**
   - Endpoint: `database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com`
   - Database name created
   - Username and password ready
   - Security group allows port 5432 from your server

2. **Connection String Format**
   ```
   postgresql://[username]:[password]@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/[database_name]?sslmode=require
   ```

## Step-by-Step Migration

### Step 1: Set AWS RDS Connection String

```bash
cd /root/mekness

# Set AWS RDS URL (replace with your actual credentials)
export AWS_RDS_URL="postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
```

### Step 2: Create Schema on AWS RDS

First, push the database schema to AWS RDS:

```bash
# Temporarily switch DATABASE_URL to AWS RDS
export DATABASE_URL="$AWS_RDS_URL"

# Push schema
npm run db:push

# This creates all tables on AWS RDS
```

### Step 3: Run Migration Script

```bash
# Set Railway URL (for export)
export RAILWAY_DATABASE_URL="postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway"

# Set AWS RDS URL (for import)
export AWS_RDS_URL="postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"

# Run migration
node migrate-to-aws-rds.js
```

### Step 4: Verify Migration

The script will automatically verify:
- ✅ All tables migrated
- ✅ Row counts match
- ✅ Data integrity

### Step 5: Update Application to Use AWS RDS

**Option A: Update Railway Environment Variables**

1. Go to Railway Dashboard → Your Project → Variables
2. Update `DATABASE_URL`:
   ```
   postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
   ```
3. Restart the application

**Option B: Update Local .env**

```bash
# Edit .env file
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
```

### Step 6: Restart Server

```bash
pm2 restart mekness-api
```

### Step 7: Verify Application Works

```bash
# Check logs
pm2 logs mekness-api --lines 50

# You should see:
# ✅ PostgreSQL connection successful
# ✅ Database connection established
```

## Tables Being Migrated

The migration script migrates all these tables:

1. `users` - User accounts
2. `admin_users` - Admin accounts
3. `trading_accounts` - Trading accounts
4. `deposits` - Deposit transactions
5. `withdrawals` - Withdrawal requests
6. `trading_history` - Trading history
7. `documents` - User documents
8. `notifications` - Notifications
9. `admin_country_assignments` - Admin country assignments
10. `activity_logs` - Activity logs
11. `support_tickets` - Support tickets
12. `support_ticket_replies` - Support ticket replies
13. `fund_transfers` - Fund transfers
14. `ib_cb_wallets` - IB/CB wallets
15. `stripe_payments` - Stripe payments
16. `user_sessions` - User sessions (if exists)

## Troubleshooting

### Connection Issues

**Error: Connection timeout**
- Check security group allows port 5432 from your server IP
- Verify RDS is publicly accessible (or use VPC peering)

**Error: SSL required**
- Ensure connection string includes `?sslmode=require`
- Code automatically enables SSL for `.rds.amazonaws.com` endpoints

**Error: Authentication failed**
- Verify username and password
- Check database name is correct

### Migration Issues

**Error: Table does not exist**
- Run `npm run db:push` first to create schema
- Ensure DATABASE_URL points to AWS RDS when running db:push

**Error: Foreign key constraint**
- Tables are migrated in order to respect foreign keys
- If errors occur, check the order in the script

**Data mismatch after migration**
- Check verification output
- Re-run migration for specific tables if needed

## Rollback Plan

If you need to rollback to Railway:

1. Update DATABASE_URL back to Railway:
   ```
   DATABASE_URL=postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway
   ```

2. Restart server:
   ```bash
   pm2 restart mekness-api
   ```

## After Migration

1. ✅ Test admin login
2. ✅ Test user registration
3. ✅ Test document upload
4. ✅ Test deposits/withdrawals
5. ✅ Verify all data is accessible

## Important Notes

- ⚠️ **Backup**: The migration script uses `ON CONFLICT DO NOTHING` to avoid duplicates
- ⚠️ **Idempotent**: You can run the migration multiple times safely
- ⚠️ **No Deletion**: Original Railway data is NOT deleted
- ✅ **Verification**: Script automatically verifies row counts match

## Support

If migration fails:
1. Check error messages in console
2. Verify both connections work independently
3. Check AWS RDS security group settings
4. Ensure schema is created on AWS RDS first




