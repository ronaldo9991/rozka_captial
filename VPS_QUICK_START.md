# 🚀 VPS PostgreSQL Quick Start Guide

## Quick Setup (5 Minutes)

### Step 1: Install PostgreSQL on VPS

```bash
# Run the setup script
sudo bash scripts/setup-postgresql-vps.sh
```

This will:
- ✅ Install PostgreSQL
- ✅ Create database `mekness_db`
- ✅ Create user `mekness_user`
- ✅ Generate secure password
- ✅ Set up proper permissions

**Save the connection string that's displayed!**

### Step 2: Update Your Application

Edit your `.env` file:

```env
DATABASE_URL=postgresql://mekness_user:your_password@localhost:5432/mekness_db
NODE_ENV=production
```

### Step 3: Test Connection

```bash
# Test PostgreSQL connection
psql -U mekness_user -d mekness_db -h localhost

# If successful, you'll see:
# mekness_db=>
# Type \q to exit
```

### Step 4: Start Your Application

```bash
npm run dev
# or
npm start
```

Tables will auto-create on first startup!

---

## Migrate Data from Railway (Optional)

If you have existing data in Railway:

```bash
# Run migration script
bash scripts/migrate-railway-to-vps.sh
```

This will:
- Export all data from Railway
- Import to VPS PostgreSQL
- Verify data integrity
- Create backups

---

## Manual Setup (Alternative)

### Install PostgreSQL

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

### Create Database

```bash
sudo -u postgres psql

# In PostgreSQL:
CREATE DATABASE mekness_db;
CREATE USER mekness_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mekness_db TO mekness_user;
ALTER USER mekness_user CREATEDB;
\c mekness_db
GRANT ALL ON SCHEMA public TO mekness_user;
\q
```

### Update .env

```env
DATABASE_URL=postgresql://mekness_user:your_secure_password@localhost:5432/mekness_db
```

---

## Connection String Format

```
postgresql://[username]:[password]@[host]:[port]/[database]
```

**Examples:**
- Local VPS: `postgresql://mekness_user:password@localhost:5432/mekness_db`
- Remote (if configured): `postgresql://mekness_user:password@your-vps-ip:5432/mekness_db`

---

## Troubleshooting

### Connection Refused

```bash
# Check if PostgreSQL is running
sudo systemctl status postgresql

# Start if not running
sudo systemctl start postgresql
```

### Authentication Failed

```bash
# Verify user exists
sudo -u postgres psql -c "\du"

# Reset password
sudo -u postgres psql -c "ALTER USER mekness_user WITH PASSWORD 'new_password';"
```

### Permission Denied

```bash
# Check pg_hba.conf
sudo cat /etc/postgresql/15/main/pg_hba.conf

# Should have:
# host    all    all    127.0.0.1/32    md5
```

---

## Performance Tips

### For Small VPS (1-2GB RAM)

Edit `/etc/postgresql/15/main/postgresql.conf`:
```conf
shared_buffers = 256MB
effective_cache_size = 768MB
```

### For Medium VPS (4GB+ RAM)

```conf
shared_buffers = 1GB
effective_cache_size = 3GB
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

---

## Backup

### Manual Backup

```bash
pg_dump -U mekness_user -d mekness_db -h localhost > backup.sql
```

### Restore

```bash
psql -U mekness_user -d mekness_db -h localhost < backup.sql
```

### Automated Backups

See `VPS_POSTGRESQL_SETUP.md` for automated backup setup.

---

## Security Checklist

- [ ] Changed default postgres password
- [ ] Created dedicated database user
- [ ] Set strong password
- [ ] Configured pg_hba.conf (local only)
- [ ] Firewall configured (if needed)
- [ ] Regular backups set up

---

## Next Steps

1. ✅ PostgreSQL installed
2. ✅ Database created
3. ✅ .env updated
4. ✅ Application tested
5. ✅ Data migrated (if needed)
6. ✅ Backups configured

**You're ready to go!** 🎉

