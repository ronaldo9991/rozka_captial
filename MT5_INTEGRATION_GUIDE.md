# MT5 Integration Guide

This guide explains how to integrate MetaTrader 5 with your Mekness trading platform.

## Overview

The MT5 integration allows:
- **Real-time account creation** in MT5 when users create trading accounts
- **Automatic balance synchronization** between Mekness and MT5
- **Trading history sync** to display profits and trades in the dashboard
- **Position monitoring** to show open trades
- **Deposit/Withdrawal sync** to reflect in MT5 balances

## Prerequisites

1. **MetaTrader 5 Server**: You need access to an MT5 server with manager credentials
2. **PHP**: The MT5 Web API requires PHP 7.4 or higher
3. **MT5 Manager Account**: Credentials with permission to create accounts and manage balances

## Environment Variables

Add these to your `.env` file:

```env
# MT5 Configuration
MT5_ENABLED=true                    # Enable/disable MT5 integration (true/false)
MT5_HOST=your-mt5-server.com        # MT5 server hostname or IP
MT5_PORT=443                        # MT5 server port (usually 443 for HTTPS)
MT5_MANAGER_LOGIN=your_manager_login # MT5 manager login
MT5_MANAGER_PASSWORD=your_password   # MT5 manager password

# Stripe Configuration (Required)
STRIPE_SECRET_KEY=sk_test_...       # Your Stripe secret key
STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key
STRIPE_WEBHOOK_SECRET=whsec_...     # Stripe webhook secret

# Database
DATABASE_URL=postgresql://...        # Your PostgreSQL connection string

# Session
SESSION_SECRET=your-secret-key      # Session encryption key
```

## Frontend Environment Variables

Add these to `MeknessDashboard/client/.env`:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Your Stripe publishable key
```

## MT5 Server Configuration

### 1. Install PHP

**Windows:**
```bash
# Download PHP from https://windows.php.net/download/
# Add PHP to your system PATH
php --version
```

**Linux/Mac:**
```bash
sudo apt-get install php php-cli php-mbstring php-xml
# or
brew install php
```

### 2. Configure MT5 Manager Account

1. Open MetaTrader 5 Server Admin
2. Create a manager account with these permissions:
   - Read client information
   - Create/modify accounts
   - Manage deposits/withdrawals
   - View trading history
3. Note the login credentials for your `.env` file

### 3. Test MT5 Connection

```bash
cd MeknessDashboard
node -e "import('./server/mt5-service.js').then(m => m.mt5Service.ping().then(console.log))"
```

## Features

### 1. Account Creation

When a user creates a **Live** trading account, the system:
1. Creates an account in the local database
2. Attempts to create the same account in MT5
3. If MT5 creation fails, the local account is still created (offline mode)

```typescript
// Automatically handled in POST /api/trading-accounts
if (type === "Live" && process.env.MT5_ENABLED === "true") {
  await mt5Service.createAccount({
    login: accountId,
    name: userFullName,
    email: userEmail,
    group: "Mekness-Standard",
    leverage: 100,
    password: generatedPassword
  });
}
```

### 2. Balance Synchronization

**Automatic Sync (Stripe Deposits):**
When a deposit is approved via Stripe:
1. Local database balance is updated
2. MT5 balance is updated via `mt5Service.updateBalance()`

**Manual Sync:**
```bash
# Sync a specific account
POST /api/mt5/sync-account/:accountId

# Sync all accounts (admin only)
POST /api/mt5/sync-all
```

### 3. Trading History Sync

Sync trading history from MT5 to local database:

```bash
POST /api/mt5/sync-history/:accountId
{
  "from": 1640995200000,  # Unix timestamp (start date)
  "to": 1672531200000     # Unix timestamp (end date)
}
```

### 4. Get Open Positions

Fetch real-time open positions from MT5:

```bash
GET /api/mt5/positions/:accountId
```

Returns:
```json
[
  {
    "ticketId": "12345",
    "symbol": "EURUSD",
    "type": "Buy",
    "volume": 0.1,
    "openPrice": 1.1234,
    "currentPrice": 1.1245,
    "stopLoss": 1.1200,
    "takeProfit": 1.1300,
    "profit": 11.00,
    "openTime": "2024-01-15T10:30:00Z",
    "status": "Open"
  }
]
```

### 5. Calculate Profit

Calculate total profit for a time period:

```bash
POST /api/mt5/calculate-profit/:accountId
{
  "from": 1640995200000,
  "to": 1672531200000
}
```

## API Endpoints

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/mt5/sync-account/:accountId` | Sync account balance and equity from MT5 |
| POST | `/api/mt5/sync-history/:accountId` | Import trading history from MT5 |
| GET | `/api/mt5/positions/:accountId` | Get open positions from MT5 |
| POST | `/api/mt5/calculate-profit/:accountId` | Calculate profit for a period |
| POST | `/api/mt5/change-password/:accountId` | Change MT5 account password |

### Admin Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mt5/health` | Check MT5 connection status |
| POST | `/api/mt5/sync-all` | Sync all accounts (cron job) |

## Background Sync (Optional)

Set up a cron job to automatically sync all accounts:

**Linux/Mac (crontab):**
```bash
# Sync every 5 minutes
*/5 * * * * curl -X POST http://localhost:5000/api/mt5/sync-all -H "Cookie: session=ADMIN_SESSION"
```

**Windows (Task Scheduler):**
Create a task that runs every 5 minutes:
```bash
curl -X POST http://localhost:5000/api/mt5/sync-all -H "Cookie: session=ADMIN_SESSION"
```

**Node.js Cron (Recommended):**
```typescript
// Add to server/index.ts
import cron from 'node-cron';

// Sync all accounts every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  try {
    // Sync logic here
    console.log('MT5 sync completed');
  } catch (error) {
    console.error('MT5 sync failed:', error);
  }
});
```

## Troubleshooting

### Connection Issues

**Error: "Failed to connect to MT5 server"**
- Verify `MT5_HOST` and `MT5_PORT` are correct
- Check firewall settings
- Ensure MT5 server is running

**Error: "Failed to authorize"**
- Verify `MT5_MANAGER_LOGIN` and `MT5_MANAGER_PASSWORD`
- Check manager account permissions

### PHP Issues

**Error: "php: command not found"**
- Install PHP and add to PATH
- Test with `php --version`

### Balance Sync Issues

**Balances don't match:**
1. Manual sync: `POST /api/mt5/sync-account/:accountId`
2. Check MT5 logs for errors
3. Verify deposits were processed correctly

## Offline Mode

If MT5 is unavailable, the system works in **offline mode**:
- Local accounts are created normally
- Deposits update local balances only
- Trading history is stored locally
- When MT5 comes back online, sync manually

## Security Best Practices

1. **Never expose MT5 credentials** in frontend code
2. **Use HTTPS** for production MT5 connections
3. **Restrict manager account permissions** to minimum required
4. **Rotate passwords** regularly
5. **Monitor API logs** for suspicious activity

## Production Deployment

1. Set `MT5_ENABLED=true` in production `.env`
2. Use production MT5 server credentials
3. Enable SSL/TLS for MT5 connection
4. Set up automatic background sync
5. Monitor MT5 connection health
6. Set up alerts for sync failures

## Support

For MT5 Web API documentation, visit:
- https://www.mql5.com/en/docs/integration/webapi

For implementation support:
- Contact your MT5 server provider
- Review MT5 server logs
- Check application logs in `MeknessDashboard/logs/`

