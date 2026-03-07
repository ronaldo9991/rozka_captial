# 🐘 PostgreSQL Setup Guide for VPS

## Quick Setup Script

Run this script on your VPS to install and configure PostgreSQL:

```bash
#!/bin/bash
# PostgreSQL Setup Script for Mekness Platform

echo "🐘 Installing PostgreSQL..."

# Detect OS
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "❌ Cannot detect OS"
    exit 1
fi

# Install PostgreSQL based on OS
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    sudo apt update
    sudo apt install -y postgresql postgresql-contrib
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ] || [ "$OS" = "fedora" ]; then
    sudo dnf install -y postgresql-server postgresql-contrib
    sudo postgresql-setup --initdb
    sudo systemctl enable postgresql
    sudo systemctl start postgresql
else
    echo "❌ Unsupported OS: $OS"
    exit 1
fi

# Get PostgreSQL version
PG_VERSION=$(psql --version | awk '{print $3}' | cut -d. -f1)
echo "✅ PostgreSQL $PG_VERSION installed"

# Create database and user
echo "📊 Creating database and user..."
sudo -u postgres psql <<EOF
-- Create database
CREATE DATABASE mekness_db;

-- Create user
CREATE USER mekness_user WITH ENCRYPTED PASSWORD 'Mekness@2024Secure!';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE mekness_db TO mekness_user;
ALTER USER mekness_user CREATEDB;

-- Connect to database and grant schema privileges
\c mekness_db
GRANT ALL ON SCHEMA public TO mekness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mekness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mekness_user;

\q
EOF

echo "✅ Database and user created"
echo ""
echo "📝 Connection Details:"
echo "   Database: mekness_db"
echo "   User: mekness_user"
echo "   Password: Mekness@2024Secure!"
echo "   Host: localhost"
echo "   Port: 5432"
echo ""
echo "🔗 Connection String:"
echo "   postgresql://mekness_user:Mekness@2024Secure!@localhost:5432/mekness_db"
echo ""
echo "⚠️  IMPORTANT: Change the password in production!"
echo "   Run: sudo -u postgres psql -c \"ALTER USER mekness_user WITH PASSWORD 'your_new_password';\""
```

## Manual Setup Steps

### 1. Install PostgreSQL

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**CentOS/RHEL/Fedora:**
```bash
sudo dnf install -y postgresql-server postgresql-contrib
sudo postgresql-setup --initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

### 2. Verify Installation

```bash
# Check PostgreSQL version
psql --version

# Check if service is running
sudo systemctl status postgresql
```

### 3. Create Database and User

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run:
CREATE DATABASE mekness_db;
CREATE USER mekness_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mekness_db TO mekness_user;
ALTER USER mekness_user CREATEDB;

# Grant schema privileges
\c mekness_db
GRANT ALL ON SCHEMA public TO mekness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO mekness_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO mekness_user;

# Exit
\q
```

### 4. Configure PostgreSQL for VPS

**Edit PostgreSQL configuration:**
```bash
# Find config file location
sudo -u postgres psql -c "SHOW config_file;"

# Usually: /etc/postgresql/15/main/postgresql.conf
sudo nano /etc/postgresql/15/main/postgresql.conf
```

**Recommended settings for VPS (adjust based on RAM):**

For 2GB RAM VPS:
```conf
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
work_mem = 4MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

For 4GB+ RAM VPS:
```conf
shared_buffers = 1GB
effective_cache_size = 3GB
maintenance_work_mem = 128MB
work_mem = 16MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
```

**Restart PostgreSQL:**
```bash
sudo systemctl restart postgresql
```

### 5. Configure Access (Security)

**Edit pg_hba.conf:**
```bash
sudo nano /etc/postgresql/15/main/pg_hba.conf
```

**Allow local connections only (recommended for VPS):**
```
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     peer
host    all             all             127.0.0.1/32            md5
host    all             all             ::1/128                 md5
```

**Reload configuration:**
```bash
sudo systemctl reload postgresql
```

### 6. Test Connection

```bash
# Test connection
psql -U mekness_user -d mekness_db -h localhost

# If successful, you'll see:
# mekness_db=>
```

### 7. Update Application Configuration

**Update your `.env` file:**
```env
DATABASE_URL=postgresql://mekness_user:your_secure_password@localhost:5432/mekness_db
NODE_ENV=production
```

### 8. Install PostgreSQL Client (if needed)

```bash
# Ubuntu/Debian
sudo apt install -y postgresql-client

# CentOS/RHEL/Fedora
sudo dnf install -y postgresql
```

## Migration from Railway to VPS PostgreSQL

### Step 1: Export Data from Railway

```bash
# Install PostgreSQL client if not installed
sudo apt install -y postgresql-client  # or: sudo dnf install -y postgresql

# Export database
pg_dump "postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway" \
  --verbose \
  --clean \
  --if-exists \
  --format=custom \
  --file=mekness_railway_backup.dump

# Or as SQL file (easier to inspect)
pg_dump "postgresql://postgres:YxscShUJpmgzIAvcjnVVkYeWZpPKUkKt@shuttle.proxy.rlwy.net:23811/railway" \
  --verbose \
  --clean \
  --if-exists \
  > mekness_railway_backup.sql
```

### Step 2: Import to VPS PostgreSQL

```bash
# Using custom format
pg_restore -U mekness_user -d mekness_db -h localhost --verbose mekness_railway_backup.dump

# Or using SQL file
psql -U mekness_user -d mekness_db -h localhost < mekness_railway_backup.sql
```

### Step 3: Verify Migration

```bash
# Connect to database
psql -U mekness_user -d mekness_db -h localhost

# Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM deposits;
SELECT COUNT(*) FROM withdrawals;
SELECT COUNT(*) FROM trading_accounts;

# Exit
\q
```

## Backup Strategy

### Create Backup Script

```bash
# Create backup directory
sudo mkdir -p /backups/postgresql
sudo chown postgres:postgres /backups/postgresql

# Create backup script
sudo nano /usr/local/bin/backup-mekness-db.sh
```

**Add this content:**
```bash
#!/bin/bash
BACKUP_DIR="/backups/postgresql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/mekness_db_$DATE.sql"

# Create backup
pg_dump -U mekness_user -d mekness_db -h localhost > "$BACKUP_FILE"

# Compress backup
gzip "$BACKUP_FILE"

# Keep only last 7 days of backups
find "$BACKUP_DIR" -name "mekness_db_*.sql.gz" -mtime +7 -delete

echo "✅ Backup created: $BACKUP_FILE.gz"
```

**Make executable:**
```bash
sudo chmod +x /usr/local/bin/backup-mekness-db.sh
```

**Add to crontab (daily at 2 AM):**
```bash
sudo crontab -e

# Add this line:
0 2 * * * /usr/local/bin/backup-mekness-db.sh >> /var/log/mekness-backup.log 2>&1
```

## Performance Monitoring

### Check Database Size

```sql
SELECT 
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = 'mekness_db';
```

### Check Table Sizes

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Check Active Connections

```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'mekness_db';
```

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Check if port is listening
sudo netstat -tlnp | grep 5432

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Permission Denied

```bash
# Check pg_hba.conf
sudo cat /etc/postgresql/15/main/pg_hba.conf

# Verify user exists
sudo -u postgres psql -c "\du"
```

### Database Not Found

```bash
# List all databases
sudo -u postgres psql -c "\l"

# Create database if missing
sudo -u postgres psql -c "CREATE DATABASE mekness_db;"
```

## Security Checklist

- [ ] Changed default postgres password
- [ ] Created dedicated database user (not using postgres user)
- [ ] Set strong password for database user
- [ ] Configured pg_hba.conf to allow only local connections
- [ ] Firewall configured (if exposing PostgreSQL)
- [ ] Regular backups configured
- [ ] PostgreSQL updated to latest version
- [ ] Logging enabled for security events

## Next Steps

1. ✅ Install PostgreSQL
2. ✅ Create database and user
3. ✅ Configure PostgreSQL settings
4. ✅ Update application .env file
5. ✅ Migrate data from Railway (if needed)
6. ✅ Test application connection
7. ✅ Set up automated backups
8. ✅ Monitor performance

## Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Example:**
```
postgresql://mekness_user:your_password@localhost:5432/mekness_db
```

