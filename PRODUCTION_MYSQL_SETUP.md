# ✅ Production MySQL Database Connection

## Production Connection String

**Use this connection string for production:**

```bash
DATABASE_URL=mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet
```

## Quick Setup

### Step 1: Set Environment Variable

```bash
export DATABASE_URL="mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet"
```

### Step 2: Or Add to .env File

```env
DATABASE_URL=mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet
```

### Step 3: Restart Application

```bash
pm2 restart mekness-api
# Or
npm run dev
```

## Production Details

- **Host:** `67.227.198.100` (Production IP - **NO localhost**)
- **Port:** `3306`
- **Database:** `cabinet`
- **Username:** `cabinet`
- **Password:** `(9:!eg#-7Nd1` (URL-encoded: `%289%3A%21eg%23-7Nd1`)

## Verification

After restart, check logs for:

```
✅ MySQL/MariaDB detected from DATABASE_URL
🐬 Using MySQL/MariaDB database
   Connection string: mysql://cabinet:****@67.227.198.100:3306/cabinet
✅ MySQL/MariaDB connection successful
✅ MySQL connection verified - Found X existing tables
   Using existing database schema (no tables will be created)
```

## Important Notes

- ✅ **Production IP Only** - Always use `67.227.198.100` (no localhost)
- ✅ **Existing Database** - Connects to existing database, no tables created
- ✅ **Real Data** - All existing data will be accessible

## Admin Dashboard

Once connected:
- **Admin Dashboard:** `https://new.mekness.com/admin/dashboard`
- **Admin Login:** `https://new.mekness.com/huwnymfphhrq/`

The dashboard will use your existing MySQL database with all real data.

---

**Status:** ✅ Production-ready MySQL connection

