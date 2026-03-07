# Mekness Platform - Connection Setup Guide

This guide ensures your backend server, database, and MT5 integration are properly connected.

## Quick Start

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your configuration** (see sections below)

3. **Verify setup:**
   ```bash
   npm run verify
   ```

4. **Start the server:**
   ```bash
   npm run dev
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

### Required Variables

```env
# Session Secret (generate a secure random string)
SESSION_SECRET=your-secure-random-string-here
```

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Configuration

**For PostgreSQL (Production):**
```env
DATABASE_URL=postgresql://user:password@host:port/database
```

**For SQLite (Development):**
```env
# Leave DATABASE_URL empty or unset to use SQLite
# Or specify a custom path:
DATABASE_PATH=./local.db
```

**Examples:**
- Railway: `postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway`
- Local PostgreSQL: `postgresql://postgres:password@localhost:5432/mekness`
- Neon: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

### MT5 Integration

**Enable MT5:**
```env
MT5_ENABLED=true
MT5_HOST=your-mt5-server.com
MT5_PORT=443
MT5_MANAGER_LOGIN=your_manager_login
MT5_MANAGER_PASSWORD=your_manager_password
```

**Disable MT5 (for development without MT5 server):**
```env
MT5_ENABLED=false
```

**PHP Configuration (if PHP is not in PATH):**
```env
PHP_BINARY=/usr/bin/php
# or on Windows:
PHP_BINARY=C:\php\php.exe
```

### Stripe Payments (Optional)

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Server Configuration

```env
NODE_ENV=development
PORT=5000
```

## Verification Steps

### 1. Run Setup Verification

```bash
npm run verify
```

This will check:
- ✅ Environment variables
- ✅ Database connection
- ✅ MT5 integration (if enabled)
- ✅ Stripe configuration
- ✅ File structure

### 2. Manual Database Test

**Test PostgreSQL connection:**
```bash
# Using psql
psql "postgresql://user:password@host:port/database" -c "SELECT NOW();"

# Or using Node.js
node -e "
import('pg').then(({Pool}) => {
  const pool = new Pool({connectionString: process.env.DATABASE_URL});
  pool.query('SELECT NOW()').then(r => {
    console.log('✅ Connected:', r.rows[0]);
    process.exit(0);
  }).catch(e => {
    console.error('❌ Failed:', e.message);
    process.exit(1);
  });
});
"
```

**Initialize database schema:**
```bash
npm run db:push
```

### 3. MT5 Connection Test

**Check PHP installation:**
```bash
php --version
```

**Test MT5 connection:**
```bash
# The verify script will test this automatically
npm run verify

# Or test manually via API (after server starts):
curl http://localhost:5000/api/mt5/health
```

**Expected response:**
```json
{
  "status": "connected",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 4. Start Server and Test

```bash
npm run dev
```

**Test endpoints:**
```bash
# Health check
curl http://localhost:5000/api/health

# MT5 health (if enabled)
curl http://localhost:5000/api/mt5/health
```

## Database Setup

### PostgreSQL Setup

1. **Create database:**
   ```sql
   CREATE DATABASE mekness;
   ```

2. **Run migrations:**
   ```bash
   npm run db:push
   ```

3. **Verify tables:**
   ```sql
   \dt
   ```

### SQLite Setup (Development)

SQLite database is created automatically at `local.db` when you start the server.

To reset:
```bash
rm local.db
npm run dev  # Will recreate on startup
```

## MT5 Integration Setup

### Prerequisites

1. **Install PHP 7.4+**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install php php-cli php-mbstring php-xml
   
   # macOS
   brew install php
   
   # Windows
   # Download from https://windows.php.net/download/
   ```

2. **Verify PHP:**
   ```bash
   php --version
   ```

3. **MT5 Server Access:**
   - You need access to an MT5 server
   - Manager account with permissions:
     - Create/modify accounts
     - View account information
     - Manage deposits/withdrawals
     - View trading history

### MT5 Configuration

1. **Get MT5 server details:**
   - Host: Your MT5 server hostname or IP
   - Port: Usually 443 (HTTPS) or 4433
   - Manager Login: Your manager account login
   - Manager Password: Your manager account password

2. **Update .env:**
   ```env
   MT5_ENABLED=true
   MT5_HOST=your-mt5-server.com
   MT5_PORT=443
   MT5_MANAGER_LOGIN=manager_login
   MT5_MANAGER_PASSWORD=manager_password
   ```

3. **Test connection:**
   ```bash
   npm run verify
   ```

### MT5 API Files

The MT5 API files are located in `mt5_api/` directory. These are PHP files that communicate with the MT5 server.

**Important:** The MT5 service uses these files via PHP CLI. Make sure:
- PHP is installed and in PATH
- All files in `mt5_api/` are present
- PHP has necessary extensions (mbstring, xml)

## Troubleshooting

### Database Connection Issues

**PostgreSQL:**
- Check connection string format
- Verify credentials
- Check firewall/network access
- Ensure database exists
- Check SSL requirements

**SQLite:**
- Check file permissions
- Ensure directory is writable
- Check disk space

### MT5 Connection Issues

**"PHP not found":**
- Install PHP
- Add PHP to system PATH
- Or set `PHP_BINARY` in `.env`

**"Failed to connect to MT5 server":**
- Verify `MT5_HOST` and `MT5_PORT`
- Check network/firewall
- Ensure MT5 server is running
- Test with MT5 Manager tool

**"Failed to authorize":**
- Verify `MT5_MANAGER_LOGIN` and `MT5_MANAGER_PASSWORD`
- Check manager account permissions
- Ensure account is enabled

### Common Issues

**"Database not initialized":**
```bash
npm run db:push
```

**"Module not found":**
```bash
npm install
```

**"Port already in use":**
- Change `PORT` in `.env`
- Or kill the process using the port

## Production Deployment

### Environment Variables

Set these in your deployment platform:

**Required:**
- `DATABASE_URL` (PostgreSQL connection string)
- `SESSION_SECRET` (secure random string)
- `NODE_ENV=production`

**Optional:**
- `MT5_ENABLED=true`
- `MT5_HOST`, `MT5_PORT`, `MT5_MANAGER_LOGIN`, `MT5_MANAGER_PASSWORD`
- `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`

### Database Migration

```bash
npm run db:push
```

### Verify Production Setup

After deployment, test:
```bash
curl https://your-domain.com/api/health
curl https://your-domain.com/api/mt5/health
```

## Support

For issues:
1. Run `npm run verify` to diagnose
2. Check server logs
3. Review MT5 server logs
4. Check database connection

## Next Steps

After setup is verified:
1. ✅ Database connected
2. ✅ MT5 integration working (if enabled)
3. ✅ Server starts successfully
4. ✅ All endpoints accessible

You're ready to use the platform!

