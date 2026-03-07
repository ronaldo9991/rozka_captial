# ✅ Connect to Existing MySQL Database

## Quick Setup

Your MySQL database already exists with data. Just connect to it!

### Step 1: Set DATABASE_URL

**Production Connection (use production IP):**
```bash
export DATABASE_URL="mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet"
```

**Or add to .env file:**
```env
DATABASE_URL=mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet
```

### Step 2: Start Application

```bash
npm run dev
# Or if using PM2
pm2 restart mekness-api
```

### Step 3: Verify Connection

Check the logs - you should see:
```
✅ MySQL/MariaDB detected from DATABASE_URL
🐬 Using MySQL/MariaDB database
✅ MySQL/MariaDB connection successful
✅ MySQL connection verified - Found X existing tables
   Using existing database schema (no tables will be created)
```

## Important Notes

✅ **No Tables Created** - The application will NOT create new tables
✅ **Uses Existing Data** - All your existing data will be accessible
✅ **Read-Only Schema** - The application connects to your existing database without modifications

## Admin Dashboard

Once connected, visit:
- **Admin Dashboard:** `https://new.mekness.com/admin/dashboard`
- **Admin Login:** `https://new.mekness.com/huwnymfphhrq/`

The dashboard will:
- ✅ Connect to your existing MySQL database
- ✅ Display all existing data
- ✅ Show real statistics from your database
- ✅ Work with all existing tables and data

## Troubleshooting

### Connection Refused
If you get `ECONNREFUSED`, check:
- MySQL server is running on `67.227.198.100:3306`
- Firewall allows connections on port 3306
- MySQL is configured to accept connections from your server IP

### Test Connection
```bash
node test-mysql-connection.js
```

## Password Encoding

The password `(9:!eg#-7Nd1` is URL-encoded as `%289%3A%21eg%23-7Nd1` in the connection string.

---

**Status:** ✅ Ready to connect to existing database

