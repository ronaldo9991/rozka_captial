# Railway Production Deployment Guide

This guide will help you deploy the Mekness application to Railway with PostgreSQL database.

## Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository (or Railway CLI)
- PostgreSQL database service on Railway

## Step 1: Railway Setup

### 1.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo" (or use Railway CLI)

### 1.2 Add PostgreSQL Database

1. In your Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will automatically create a PostgreSQL instance
4. Note the connection details (they're auto-set as environment variables)

## Step 2: Environment Variables

Set these in Railway dashboard (Settings → Variables):

```env
# Database (auto-set by Railway PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Session & Security
SESSION_SECRET=<generate-random-32-char-string>
NODE_ENV=production

# Server
PORT=5000

# Optional: Payment APIs
# Stripe Payment Gateway (Sandbox/Test Mode)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Frontend URL (for Stripe redirects)
FRONTEND_URL=https://yourdomain.com

# Optional: MT5 Integration
MT5_ENABLED=false

# Frontend URL (your Railway domain - will be set automatically)
FRONTEND_URL=https://your-app.railway.app
```

### Generate SESSION_SECRET

```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows PowerShell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

## Step 3: Database Migration

### Option A: Automatic Migration (Recommended)

The app will automatically run migrations on startup. However, for the first deployment:

1. **Before first deploy**: Run migrations manually using Railway CLI:

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to your project
railway link

# Run migrations
railway run npm run db:push
```

### Option B: Manual Migration via Railway Dashboard

1. Go to your PostgreSQL service in Railway
2. Click "Query" tab
3. Or use the connection string with a PostgreSQL client

## Step 4: Deploy Application

### 4.1 Deploy from GitHub

1. Connect your GitHub repository to Railway
2. Railway will auto-detect Node.js
3. Build command: `npm run build`
4. Start command: `npm start`
5. Railway will automatically deploy on every push

### 4.2 Deploy via Railway CLI

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Deploy
railway up
```

## Step 5: Verify Deployment

1. **Check Logs**: Railway dashboard → Deployments → View logs
2. **Test Database Connection**: Look for "✅ PostgreSQL connection successful" in logs
3. **Test API**: Visit your Railway URL (e.g., `https://your-app.railway.app`)
4. **Test Admin Login**: Use your admin credentials

## Step 6: Post-Deployment

### 6.1 Create Admin User

If you don't have an admin user yet, you can:

1. **Via Database**: Insert directly into `admin_users` table
2. **Via API**: Use the admin signup endpoint (if available)
3. **Via Seed Script**: Run `npm run seed` (if configured)

### 6.2 Verify Tables

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

Expected tables:
- users
- admin_users
- trading_accounts
- deposits
- withdrawals
- trading_history
- documents
- notifications
- admin_country_assignments
- activity_logs
- support_tickets
- support_ticket_replies
- fund_transfers
- ib_cb_wallets
- stripe_payments

## Troubleshooting

### Database Connection Issues

**Error**: "PostgreSQL connection failed"

**Solutions**:
1. Verify `DATABASE_URL` is set correctly in Railway
2. Check PostgreSQL service is running
3. Ensure SSL is configured (Railway uses SSL by default)
4. Check Railway logs for detailed error messages

### Migration Issues

**Error**: "Table already exists"

**Solution**: This is normal if tables already exist. The app will continue.

**Error**: "Migration failed"

**Solutions**:
1. Run migrations manually: `railway run npm run db:push`
2. Check database permissions
3. Verify schema file is correct

### Build Issues

**Error**: "Build failed"

**Solutions**:
1. Check `package.json` scripts are correct
2. Verify all dependencies are listed
3. Check Railway build logs for specific errors
4. Ensure Node.js version is compatible (v18+)

### Port Issues

**Error**: "Port already in use"

**Solution**: Railway automatically sets `PORT` environment variable. Don't hardcode port 5000.

## Database URLs Explained

Railway provides two database URLs:

1. **DATABASE_URL**: Internal URL (use this in Railway)
   - Format: `postgresql://user:pass@postgres.railway.internal:5432/railway`
   - Only accessible from within Railway network

2. **DATABASE_PUBLIC_URL**: External URL (for local tools)
   - Format: `postgresql://user:pass@shuttle.proxy.rlwy.net:23811/railway`
   - Accessible from outside Railway

**Always use `DATABASE_URL` in Railway environment variables.**

## Monitoring

### Railway Dashboard

- **Metrics**: View CPU, Memory, Network usage
- **Logs**: Real-time application logs
- **Deployments**: Deployment history and rollback

### Database Monitoring

- **PostgreSQL Metrics**: Available in Railway dashboard
- **Connection Pool**: Monitor active connections
- **Query Performance**: Use PostgreSQL query logs

## Scaling

### Horizontal Scaling

Railway supports horizontal scaling:
1. Go to Settings → Scaling
2. Increase instance count
3. Railway will load balance automatically

### Database Scaling

PostgreSQL on Railway can be scaled:
1. Go to PostgreSQL service
2. Upgrade plan for more resources
3. Consider read replicas for high traffic

## Backup & Recovery

### Automatic Backups

Railway PostgreSQL includes automatic backups:
- Daily backups retained for 7 days
- Point-in-time recovery available

### Manual Backup

```bash
# Using Railway CLI
railway connect postgres
pg_dump $DATABASE_URL > backup.sql
```

### Restore

```bash
psql $DATABASE_URL < backup.sql
```

## Cost Estimation

**Railway Pricing** (as of 2024):
- **Hobby Plan**: $5/month + usage
- **Pro Plan**: $20/month + usage
- **PostgreSQL**: Included in plan or $5-20/month depending on size

**Estimated Monthly Cost**:
- Small app: ~$10-15/month
- Medium app: ~$20-30/month
- Large app: ~$50-100/month

## Security Best Practices

1. **Environment Variables**: Never commit secrets to Git
2. **Database**: Use strong passwords (Railway generates these)
3. **SSL**: Always use SSL for database connections
4. **Session Secret**: Use a strong, random SESSION_SECRET
5. **HTTPS**: Railway provides HTTPS by default
6. **Rate Limiting**: Consider adding rate limiting for production

## Support

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Railway Discord**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Report bugs in your repository

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Run database migrations
3. ✅ Create admin user
4. ✅ Test all features
5. ✅ Set up custom domain (optional)
6. ✅ Configure monitoring
7. ✅ Set up CI/CD (automatic with GitHub)

---

**Congratulations!** Your Mekness application is now running in production on Railway! 🚀

