# MySQL Database Connection String

## Connection Details

- **Host:** `67.227.198.100`
- **Port:** `3306`
- **Database:** `cabinet`
- **Username:** `cabinet`
- **Password:** `(9:!eg#-7Nd1`

## DATABASE_URL Connection String

The password needs to be URL-encoded. Use this connection string:

```bash
DATABASE_URL=mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet
```

**Password Encoding:**
- Original: `(9:!eg#-7Nd1`
- Encoded: `%289%3A%21eg%23-7Nd1`
- Characters encoded: `(` → `%28`, `:` → `%3A`, `!` → `%21`, `#` → `%23`

## Setup Instructions

### Step 1: Set DATABASE_URL

**If running on the same server (67.227.198.100):**
```bash
# Use localhost instead of IP
export DATABASE_URL="mysql://cabinet:%289%3A%21eg%23-7Nd1@localhost:3306/cabinet"
```

**If running remotely:**
```bash
# Use the IP address
export DATABASE_URL="mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet"
```

**Or add to .env file:**
```env
DATABASE_URL=mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet
```

### Step 2: Configure MySQL for Remote Access (if needed)

If connection is refused, MySQL might not be configured for remote access:

1. **Edit MySQL config:**
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   ```
   
   Change:
   ```ini
   bind-address = 127.0.0.1
   ```
   
   To:
   ```ini
   bind-address = 0.0.0.0
   ```

2. **Restart MySQL:**
   ```bash
   sudo systemctl restart mysql
   ```

3. **Grant remote access (if needed):**
   ```sql
   GRANT ALL PRIVILEGES ON cabinet.* TO 'cabinet'@'%' IDENTIFIED BY '(9:!eg#-7Nd1';
   FLUSH PRIVILEGES;
   ```

4. **Check firewall:**
   ```bash
   sudo ufw allow 3306/tcp
   ```

### Step 3: Test Connection

```bash
# Test from command line
mysql -h 67.227.198.100 -u cabinet -p'(9:!eg#-7Nd1' cabinet -e "SELECT NOW();"

# Or use the test script
node test-mysql-connection.js
```

### Step 4: Start Application

```bash
# Set DATABASE_URL
export DATABASE_URL="mysql://cabinet:%289%3A%21eg%23-7Nd1@67.227.198.100:3306/cabinet"

# Start the application
npm run dev
# Or if using PM2
pm2 restart mekness-api
```

## Verification

After starting, check logs for:

```
✅ MySQL/MariaDB detected from DATABASE_URL
🐬 Using MySQL/MariaDB database
   Connection string: mysql://cabinet:****@67.227.198.100:3306/cabinet
✅ MySQL/MariaDB connection successful
   Server time: [timestamp]
   Database version: [version]
🗄️ Ensuring all MySQL tables exist...
✅ MySQL schema verified and up-to-date
```

## Troubleshooting

### Connection Refused (ECONNREFUSED)
- MySQL not accepting remote connections
- Firewall blocking port 3306
- MySQL not running

**Solution:** Configure MySQL for remote access (see Step 2)

### Access Denied (ER_ACCESS_DENIED_ERROR)
- Wrong username/password
- User doesn't have access to database

**Solution:** Verify credentials and grant permissions

### Database Not Found (ER_BAD_DB_ERROR)
- Database `cabinet` doesn't exist

**Solution:** Create database:
```sql
CREATE DATABASE cabinet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## Admin Dashboard

Once connected, the admin dashboard at `/admin/dashboard` will:
- ✅ Connect to the real MySQL database
- ✅ Display real data from the database
- ✅ Use all existing data in the `cabinet` database
- ✅ Show statistics, users, documents, etc.

## Notes

- **If running on same server:** Use `localhost` instead of IP for better performance
- **Password encoding:** Always URL-encode special characters in connection string
- **Character set:** Database uses `utf8mb4` for full Unicode support
- **Existing data:** All existing data in the `cabinet` database will be accessible

---

**Status:** ✅ MySQL support added, ready to connect

