# Complete Setup Guide - Mekness Trading Platform

This guide will help you set up and run the Mekness trading platform with all features working correctly.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Stripe Configuration](#stripe-configuration)
5. [MT5 Integration (Optional)](#mt5-integration-optional)
6. [Installation](#installation)
7. [Running the Application](#running-the-application)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher (or Neon account)
- **Stripe Account**: For payment processing
- **PHP** (optional): For MT5 integration
- **Git**: For version control

## Database Setup

### Option 1: Neon (Recommended for Development/Hosting)

1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:pass@host/database?sslmode=require`)
4. Save this for the `.env` file

### Option 2: Local PostgreSQL

**Windows:**
```bash
# Download and install PostgreSQL from postgresql.org
# During installation, remember your password

# Create database
psql -U postgres
CREATE DATABASE mekness_db;
\q
```

**Linux/Mac:**
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib  # Ubuntu/Debian
# or
brew install postgresql  # Mac

# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # Mac

# Create database
psql postgres
CREATE DATABASE mekness_db;
\q
```

## Environment Configuration

### 1. Backend Environment Variables

Create `MeknessDashboard/.env` with:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/mekness_db

# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5000

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this

# Stripe Payment Configuration (REQUIRED)
STRIPE_SECRET_KEY=sk_test_51...your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_51...your_key_here
STRIPE_WEBHOOK_SECRET=whsec_...your_webhook_secret_here

# MT5 Integration (Optional - set to false if not using MT5)
MT5_ENABLED=false
MT5_HOST=your-mt5-server.com
MT5_PORT=443
MT5_MANAGER_LOGIN=manager_login
MT5_MANAGER_PASSWORD=manager_password
```

### 2. Frontend Environment Variables

Create `MeknessDashboard/client/.env` with:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_51...your_key_here
```

## Stripe Configuration

### 1. Create Stripe Account

1. Go to [stripe.com](https://stripe.com) and create an account
2. Navigate to **Developers** → **API keys**
3. Copy both **Publishable key** and **Secret key**
4. Add them to your `.env` files

### 2. Set Up Webhook

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter: `http://localhost:5000/api/stripe/webhook` (for development)
4. Select events to listen to:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
5. Copy the **Webhook signing secret** to `STRIPE_WEBHOOK_SECRET` in `.env`

### 3. Test Mode

For development, use **Test mode** keys (start with `pk_test_` and `sk_test_`).

**Test Card Numbers:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires authentication: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## MT5 Integration (Optional)

If you want to integrate with MetaTrader 5:

1. **Install PHP** (required for MT5 Web API)
   ```bash
   # Windows: Download from php.net
   # Linux: sudo apt-get install php php-cli
   # Mac: brew install php
   ```

2. **Configure MT5 credentials** in `.env`:
   ```env
   MT5_ENABLED=true
   MT5_HOST=your-server.com
   MT5_PORT=443
   MT5_MANAGER_LOGIN=your_login
   MT5_MANAGER_PASSWORD=your_password
   ```

3. See [MT5_INTEGRATION_GUIDE.md](./MT5_INTEGRATION_GUIDE.md) for detailed setup

**Note:** MT5 is optional. The platform works without it in "offline mode" where accounts are managed locally.

## Installation

1. **Clone the repository**
   ```bash
   cd MeknessDashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment files**
   - Create `.env` in `MeknessDashboard/` with backend variables
   - Create `.env` in `MeknessDashboard/client/` with frontend variables

4. **Push database schema**
   ```bash
   npm run db:push
   ```

   This creates all necessary tables in your database.

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts:
- Backend server on `http://localhost:5000`
- Frontend dev server with hot reload
- Vite build system

Open your browser to: `http://localhost:5000`

### Production Mode

```bash
npm run build
npm start
```

## Testing

### Create Test Admin Account

The system creates a default super admin on first run:
- **Username:** `admin`
- **Password:** `admin123`
- **Email:** `admin@mekness.com`

### Create Test User

1. Navigate to `http://localhost:5000/signup`
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Full Name: `Test User`
3. Click **Sign Up**

### Test Deposit Flow

1. Log in as test user
2. Go to **Dashboard** → **Deposit**
3. Create a trading account if you don't have one
4. Select the account
5. Choose payment method (Card or Crypto)
6. Enter amount (minimum $10)
7. Click **Deposit**
8. Use Stripe test card: `4242 4242 4242 4242`
9. Complete the payment
10. Check balance updates

### Test Admin Features

1. Log out and log in with admin credentials
2. You'll be redirected to `/admin/dashboard`
3. Test admin features:
   - View all users
   - Verify documents
   - Approve/reject deposits
   - View activity logs
   - Impersonate users (super admin only)
   - Manage other admins

## Troubleshooting

### Database Connection Issues

**Error: "Failed to connect to database"**
```bash
# Check DATABASE_URL is correct
# Test connection:
psql "postgresql://user:pass@host/db"
```

### Stripe Errors

**Error: "No such payment intent"**
- Check `STRIPE_SECRET_KEY` is correct
- Ensure you're using the same Stripe account for both keys
- Verify webhook secret matches

**Error: "Invalid publishable key"**
- Check `VITE_STRIPE_PUBLISHABLE_KEY` in `client/.env`
- Restart frontend after changing `.env`

### Port Already in Use

**Error: "Port 5000 is already in use"**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>

# Or change port in .env
PORT=3000
```

### MT5 Connection Issues

**Error: "Failed to connect to MT5"**
- Verify MT5 server is running
- Check firewall settings
- Test MT5 credentials
- See [MT5_INTEGRATION_GUIDE.md](./MT5_INTEGRATION_GUIDE.md)

### Build Errors

**Error: "Module not found"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Error: "Out of memory"**
```bash
# Increase Node memory
NODE_OPTIONS=--max_old_space_size=4096 npm run build
```

## Feature Checklist

### User Features
- [x] User registration and authentication
- [x] Document verification (ID, Address proof)
- [x] Trading account creation (Demo/Live)
- [x] Deposits (Card & Cryptocurrency via Stripe)
- [x] Withdrawals
- [x] Trading history
- [x] Profile management
- [x] Support tickets
- [x] Real-time notifications
- [x] Live forex ticker
- [x] WhatsApp support button

### Admin Features
- [x] Three-tier admin system (Super/Middle/Normal)
- [x] User management
- [x] Document verification
- [x] Deposit/withdrawal approval
- [x] Trading account management
- [x] Support ticket management
- [x] Activity logs
- [x] Fund management (add/remove)
- [x] User impersonation (super admin)
- [x] Admin management
- [x] Real-time dashboard statistics

### Payment Features
- [x] Stripe card payments
- [x] Stripe cryptocurrency payments (BTC, ETH, USDT, USDC)
- [x] Webhook handling
- [x] Automatic balance updates
- [x] Payment history

### MT5 Integration (Optional)
- [x] Account creation in MT5
- [x] Balance synchronization
- [x] Trading history sync
- [x] Open positions monitoring
- [x] Profit calculation
- [x] Password management

## Production Deployment

### Environment Setup

1. Set `NODE_ENV=production`
2. Use production Stripe keys (start with `pk_live_` and `sk_live_`)
3. Use production database (recommended: Neon, Supabase, or managed PostgreSQL)
4. Set strong `SESSION_SECRET`
5. Configure SSL/HTTPS
6. Set up domain and update `FRONTEND_URL`

### Deployment Platforms

**Vercel (Recommended):**
1. Connect GitHub repository
2. Add environment variables
3. Deploy automatically

**Railway:**
1. Connect repository
2. Add PostgreSQL service
3. Configure environment variables
4. Deploy

**DigitalOcean:**
1. Create droplet
2. Install Node.js and PostgreSQL
3. Clone repository
4. Set up PM2 or systemd
5. Configure nginx reverse proxy

### Post-Deployment

1. **Test all features** in production
2. **Set up monitoring** (e.g., Sentry, LogRocket)
3. **Configure backups** for database
4. **Set up SSL certificate** (Let's Encrypt)
5. **Update Stripe webhook URL** to production domain
6. **Enable MT5** if applicable

## Support

For issues or questions:
- Check this guide and other documentation files
- Review error logs in console
- Contact Mekness support

## Next Steps

After setup:
1. Customize branding (colors, logo, text)
2. Add more payment methods if needed
3. Configure email notifications
4. Set up automated backups
5. Enable monitoring and analytics
6. Launch marketing campaigns

---

**Last Updated:** January 2025  
**Version:** 1.0.0

