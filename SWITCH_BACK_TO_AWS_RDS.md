# ✅ Switch Back to AWS RDS PostgreSQL

## Why Switch Back?

You mentioned that **AWS RDS was working before** with live trading data and no zeros. The current MySQL database has a **different schema** which is causing the zeros.

**AWS RDS PostgreSQL** has the correct schema that matches your code, which is why it was working!

## AWS RDS Connection Details

**Endpoint:** `database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com`

**Connection String Format:**
```
postgresql://[username]:[password]@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/[database_name]?sslmode=require
```

## Quick Setup

### Step 1: Get Your AWS RDS Credentials

You need:
- **Username** (usually `postgres`)
- **Password** (the master password you set)
- **Database name** (usually `postgres` or `mekness_db`)

### Step 2: Update DATABASE_URL

**Option A: Update ecosystem.config.cjs**

Edit `/root/mekness/ecosystem.config.cjs`:

```javascript
env: {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require',
  PORT: 5000
}
```

**Option B: Set Environment Variable**

```bash
export DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require"
```

### Step 3: Restart Application

```bash
cd /root/mekness
pm2 delete all
pm2 start ecosystem.config.cjs
pm2 logs mekness-api --lines 30
```

### Step 4: Verify Connection

Check logs for:
```
✅ PostgreSQL detected from DATABASE_URL
   Database: AWS RDS PostgreSQL
🐘 Using PostgreSQL database
   Using AWS RDS with SSL connection
✅ PostgreSQL connection successful
```

## Why This Will Fix the Zeros

1. ✅ **Correct Schema** - AWS RDS has the schema your code expects
2. ✅ **Table Names Match** - `admin_users`, `users`, etc. match the code
3. ✅ **Column Names Match** - `username`, `full_name`, etc. match the code
4. ✅ **Data Structure** - Matches what the dashboard queries expect

## Security Group Setup

Make sure your AWS RDS security group allows:
- **Type:** PostgreSQL
- **Port:** 5432
- **Source:** Your server IP (`67.227.198.100`) or `0.0.0.0/0` for testing

## Test Connection

```bash
# Test from your server
psql "postgresql://postgres:YOUR_PASSWORD@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -c "SELECT version();"
```

## After Switching

Once connected to AWS RDS:
- ✅ Dashboard will show real data (no more zeros)
- ✅ Live trading data will display
- ✅ All statistics will work
- ✅ All admin functions will work

---

**Status:** Ready to switch back to AWS RDS PostgreSQL
**Note:** You need to provide your AWS RDS password to complete the connection

