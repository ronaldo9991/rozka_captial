# 🚀 Amazon RDS Migration Guide

## Overview

This guide will help you migrate from Railway PostgreSQL to Amazon RDS with precision and verify all data is migrated correctly.

## Prerequisites

1. **Amazon RDS Instance Details:**
   - Endpoint: `database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com`
   - Port: `5432` (default PostgreSQL port)
   - Database name: (you need to provide this)
   - Username: (you need to provide this)
   - Password: (you need to provide this)

2. **Current Database (Railway):**
   - Endpoint: `shuttle.proxy.rlwy.net:23811`
   - Database: `railway`
   - Username: `postgres`
   - Password: `YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt`

## Step 1: Check Current Data

First, let's see what data exists in your current Railway database:

```bash
# Set Railway database URL
export DATABASE_URL="postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway"

# Check current data
npm run check:data
```

This will show you:
- How many users exist
- How many deposits/withdrawals
- How many trading accounts
- All other data counts

## Step 2: Prepare RDS Connection

Update your `.env` file with RDS credentials:

```env
# Amazon RDS Configuration
RDS_USERNAME=your_rds_username
RDS_PASSWORD=your_rds_password
RDS_DATABASE=your_database_name
RDS_HOST=database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com
RDS_PORT=5432

# RDS Connection String (will be constructed automatically)
RDS_DATABASE_URL=postgresql://${RDS_USERNAME}:${RDS_PASSWORD}@${RDS_HOST}:${RDS_PORT}/${RDS_DATABASE}

# Keep Railway URL for migration
RAILWAY_DATABASE_URL=postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway
```

## Step 3: Test RDS Connection

Test that you can connect to RDS:

```bash
# Set RDS credentials
export RDS_USERNAME="your_username"
export RDS_PASSWORD="your_password"
export RDS_DATABASE="your_database_name"

# Test connection
psql "postgresql://${RDS_USERNAME}:${RDS_PASSWORD}@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/${RDS_DATABASE}" -c "SELECT version();"
```

## Step 4: Run Migration

The migration script will:
1. Export all data from Railway
2. Create tables in RDS (if they don't exist)
3. Import all data to RDS
4. Verify data integrity

```bash
# Run migration
RDS_USERNAME=your_username \
RDS_PASSWORD=your_password \
RDS_DATABASE=your_database_name \
npm run migrate:rds
```

## Step 5: Update Application to Use RDS

After successful migration, update your `.env`:

```env
# Switch to RDS
DATABASE_URL=postgresql://your_username:your_password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/your_database_name
```

## Step 6: Verify Migration

1. **Check data in RDS:**
   ```bash
   export DATABASE_URL="postgresql://your_username:your_password@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/your_database_name"
   npm run check:data
   ```

2. **Start your application:**
   ```bash
   npm run dev
   ```

3. **Check super admin panel:**
   - Login as super admin
   - Verify all data is showing correctly
   - Check user counts, deposits, withdrawals, etc.

## Troubleshooting

### Connection Issues

**Error: "Connection refused"**
- Check RDS security group allows connections from your IP
- Verify RDS instance is publicly accessible (if needed)
- Check VPC and subnet settings

**Error: "Authentication failed"**
- Verify username and password
- Check if user has proper permissions

### Migration Issues

**Error: "Table already exists"**
- This is normal if tables were created manually
- The script uses `CREATE TABLE IF NOT EXISTS` so it's safe

**Error: "Foreign key constraint violation"**
- The script imports data in the correct order to respect foreign keys
- If this happens, check the import order in the script

### Data Missing After Migration

1. **Check migration logs** - Look for any errors during import
2. **Verify source data** - Run `npm run check:data` on Railway database
3. **Check RDS data** - Run `npm run check:data` on RDS database
4. **Compare counts** - The script shows a verification summary

## Why Data Might Be Missing

### Possible Reasons:

1. **Tables were recreated** - If tables were dropped and recreated, all data would be lost
2. **Database was reset** - If the database was reset, data would be gone
3. **Connection to wrong database** - If connecting to a different database
4. **Data never existed** - If data was never created in the first place

### How to Investigate:

1. **Check Railway database directly:**
   ```bash
   psql "postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway" -c "SELECT COUNT(*) FROM users;"
   ```

2. **Check server logs** - Look for any errors when fetching data
3. **Use diagnostic endpoint** - Access `/api/admin/diagnostic` as super admin

## Security Notes

⚠️ **Important:**
- Never commit `.env` file with credentials
- Use environment variables in production
- Rotate passwords after migration
- Enable SSL for RDS connections
- Restrict RDS security group to only necessary IPs

## Next Steps After Migration

1. ✅ Update all environment variables
2. ✅ Test all functionality
3. ✅ Monitor application logs
4. ✅ Set up RDS backups
5. ✅ Configure monitoring and alerts
6. ✅ Update documentation

## Support

If you encounter issues:
1. Check the migration logs
2. Verify RDS connection
3. Check server logs for errors
4. Use the diagnostic endpoint: `/api/admin/diagnostic`


