# 🚀 Switch from Railway to AWS RDS Database

## Overview

This guide will help you switch your admin dashboard from Railway PostgreSQL to AWS RDS PostgreSQL. The application has been updated to automatically detect and configure AWS RDS connections with proper SSL support.

## ✅ Code Updates Applied

1. **`server/db.ts`** - Updated to detect AWS RDS URLs and enable SSL automatically
2. **`server/index.ts`** - Updated session store to support AWS RDS SSL connections
3. **Database Detection** - Automatically detects:
   - AWS RDS (`.rds.amazonaws.com`)
   - Railway PostgreSQL (`railway`, `rlwy.net`)
   - Local PostgreSQL
   - SQLite (fallback)

## 📋 Prerequisites

Before switching, ensure you have:

1. **AWS RDS Instance Created**
   - Endpoint: `database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com`
   - Database name created
   - Username and password ready
   - Security group allows port 5432 from your server

2. **Connection String Format**
   ```
   postgresql://[username]:[password]@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/[database_name]?sslmode=require
   ```

## 🔄 Step-by-Step Migration

### Step 1: Verify Current Database

Check what database you're currently using:

```bash
cd /root/mekness
npm run verify:db
# Or manually:
tsx scripts/verify-database-connection.ts
```

This will show:
- Current database provider (Railway/AWS RDS/Local)
- Connection status
- Data counts
- Table information

### Step 2: Prepare AWS RDS Connection String

Construct your AWS RDS connection string:

```bash
# Format:
export AWS_RDS_URL="postgresql://[username]:[password]@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/[database_name]?sslmode=require"

# Example:
export AWS_RDS_URL="postgresql://postgres:YourPassword123@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require"
```

### Step 3: Test AWS RDS Connection

Test the connection before switching:

```bash
# Test connection
DATABASE_URL="$AWS_RDS_URL" tsx scripts/verify-database-connection.ts
```

If successful, you'll see:
```
✅ Database Connection: SUCCESS
   Server Time: [timestamp]
   PostgreSQL Version: PostgreSQL [version]
   Database Name: [database_name]
```

### Step 4: Create Schema on AWS RDS

Push the database schema to AWS RDS:

```bash
# Temporarily switch to AWS RDS
export DATABASE_URL="$AWS_RDS_URL"

# Push schema (creates all tables)
npm run db:push
```

This creates all necessary tables on AWS RDS.

### Step 5: Migrate Data (Optional)

If you have existing data in Railway that you want to migrate:

```bash
# Set both URLs
export RAILWAY_DATABASE_URL="postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway"
export AWS_RDS_URL="postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require"

# Run migration script
node migrate-to-aws-rds.js
```

### Step 6: Update Application to Use AWS RDS

**Option A: Update Railway Environment Variables**

1. Go to Railway Dashboard → Your Project → Variables
2. Update `DATABASE_URL`:
   ```
   postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require
   ```
3. Restart the application

**Option B: Update Local .env File**

```bash
# Edit .env file
nano .env

# Update DATABASE_URL:
DATABASE_URL=postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require
```

**Option C: Update on Server (if running on VPS)**

```bash
# If using PM2
pm2 stop mekness-api

# Update environment variable
export DATABASE_URL="postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require"

# Or add to .env file
echo 'DATABASE_URL=postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/mekness_db?sslmode=require' >> .env

# Restart
pm2 restart mekness-api
pm2 logs mekness-api
```

### Step 7: Verify Switch

After updating DATABASE_URL, verify the connection:

```bash
# Check logs
pm2 logs mekness-api --lines 50

# Or run verification script
npm run verify:db
```

You should see:
```
🏢 Database Provider: AWS RDS PostgreSQL
✅ Database Connection: SUCCESS
```

## 🔍 Verification Checklist

After switching, verify:

- [ ] Database connection successful
- [ ] All tables exist on AWS RDS
- [ ] Admin dashboard loads at `/admin/dashboard`
- [ ] Stats API (`/api/admin/stats`) returns data
- [ ] No connection errors in logs
- [ ] SSL connection working (check logs for "Using AWS RDS with SSL connection")

## 🐛 Troubleshooting

### Connection Refused

**Error:** `ECONNREFUSED`

**Solution:**
- Check AWS RDS security group allows connections from your server IP
- Verify port 5432 is open
- Check if RDS instance is publicly accessible (or use VPC peering)

### SSL Connection Failed

**Error:** `SSL connection failed`

**Solution:**
- Ensure `?sslmode=require` is in connection string
- Code automatically enables SSL for `.rds.amazonaws.com` endpoints
- Check AWS RDS SSL certificate configuration

### Authentication Failed

**Error:** `password authentication failed`

**Solution:**
- Verify username and password are correct
- Check if database user exists
- Ensure password doesn't contain special characters that need URL encoding

### Host Not Found

**Error:** `ENOTFOUND` or `getaddrinfo ENOTFOUND`

**Solution:**
- Verify RDS endpoint is correct
- Check DNS resolution
- Ensure RDS instance is in "available" state

## 📊 Admin Dashboard Routes

After switching to AWS RDS, these routes will use the real database:

- ✅ `/admin/dashboard` - Dashboard overview with stats
- ✅ `/api/admin/stats` - Statistics API
- ✅ `/api/admin/users` - Users list
- ✅ `/api/admin/documents` - Documents list
- ✅ `/api/admin/deposits` - Deposits list
- ✅ `/api/admin/withdrawals` - Withdrawals list
- ✅ All other admin routes

## 🔐 Security Notes

1. **Never commit DATABASE_URL to git** - Use environment variables
2. **Use strong passwords** - AWS RDS master password should be complex
3. **Restrict security group** - Only allow connections from your server IP
4. **Enable SSL** - Always use `sslmode=require` for AWS RDS
5. **Regular backups** - Configure AWS RDS automated backups

## 📝 Next Steps

1. ✅ Switch DATABASE_URL to AWS RDS
2. ✅ Verify connection works
3. ✅ Test admin dashboard
4. ✅ Monitor logs for any issues
5. ✅ Set up AWS RDS automated backups
6. ✅ Configure monitoring/alerts

## 🆘 Support

If you encounter issues:

1. Check server logs: `pm2 logs mekness-api`
2. Run verification: `npm run verify:db`
3. Test connection: `tsx scripts/verify-database-connection.ts`
4. Check AWS RDS console for instance status

---

**Last Updated:** After AWS RDS configuration updates
**Status:** ✅ Ready for migration

