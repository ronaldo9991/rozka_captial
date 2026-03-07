# AWS RDS PostgreSQL Setup

## Your RDS Endpoint
```
database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com
```

## Connection String Format

You need to construct your connection string with:
- **Username**: (usually `postgres` or what you set during RDS creation)
- **Password**: (the master password you set)
- **Database name**: (usually `postgres` or `mekness_db`)

### Format:
```
postgresql://[username]:[password]@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/[database_name]?sslmode=require
```

### Example:
```
postgresql://postgres:YourPassword123@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
```

## Configuration Steps

### 1. Update Environment Variable

**If using Railway:**
1. Go to Railway Dashboard → Your Project → Variables
2. Update `DATABASE_URL` with your AWS RDS connection string

**If using local `.env` file:**
```env
DATABASE_URL=postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require
```

### 2. Security Group Configuration

Make sure your RDS security group allows connections:
- **Type**: PostgreSQL
- **Port**: 5432
- **Source**: Your server's IP address (or 0.0.0.0/0 for testing - restrict later)

### 3. Test Connection

```bash
# Test from server
psql "postgresql://postgres:YourPassword@database-1.cluster-ckzyy4eccgqg.us-east-1.rds.amazonaws.com:5432/postgres?sslmode=require" -c "SELECT version();"
```

### 4. Push Database Schema

```bash
cd /root/mekness
npm run db:push
```

### 5. Restart Server

```bash
pm2 restart mekness-api
```

## Code Updates Applied

✅ Updated `server/db.ts` - Now detects AWS RDS URLs and enables SSL
✅ Updated `server/index.ts` - Session store now supports AWS RDS SSL

## Verification

After restart, check logs:
```bash
pm2 logs mekness-api --lines 50
```

You should see:
```
✅ PostgreSQL detected from DATABASE_URL
🐘 Using PostgreSQL database
   Connection string: postgresql://postgres:****@database-1.cluster...
   Using SSL connection
✅ PostgreSQL connection successful
```

## Important Notes

1. **Cluster Endpoint**: Your endpoint is a cluster endpoint, which means you might be using Aurora PostgreSQL. This is fine and works the same way.

2. **SSL Required**: AWS RDS requires SSL for external connections. The code now automatically enables SSL for `.rds.amazonaws.com` endpoints.

3. **Security**: Make sure your security group only allows connections from trusted IPs in production.

4. **React Error #310**: This is NOT a database issue - it's a browser cache issue. Clear your browser cache (`Ctrl+Shift+R`) to fix it.




