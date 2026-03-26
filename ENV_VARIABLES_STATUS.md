# Environment Variables Status Check

Since you mentioned environment variables are already configured, here's how to verify them:

## Quick Check

```bash
# Check what environment variables are currently set
npm run check-env

# Or comprehensive verification (tests connections too)
npm run verify
```

## Environment Variable Sources

The application checks for environment variables from multiple sources:

1. **`.env` file** (local development)
2. **System environment variables** (deployment platforms)
3. **Platform-specific variables:**
   - **Railway**: Auto-sets `DATABASE_URL` from PostgreSQL service
   - **Vercel**: Uses Vercel environment variables
   - **AWS**: Uses AWS environment variables

## Required Variables

### Critical (Must be set):
- `SESSION_SECRET` - Session encryption key
- `DATABASE_URL` - Database connection string (or leave empty for SQLite)

### Optional but Recommended:
- `NODE_ENV` - Environment mode (development/production)
- `PORT` - Server port (defaults to 5000)

### MT5 Integration (if using):
- `MT5_ENABLED=true`
- `MT5_HOST` - MT5 server hostname
- `MT5_PORT` - MT5 server port (usually 443)
- `MT5_MANAGER_LOGIN` - MT5 manager account
- `MT5_MANAGER_PASSWORD` - MT5 manager password

### Stripe (if using):
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Verification

The verification script (`npm run verify`) will:
1. ✅ Check all environment variables
2. ✅ Test database connection
3. ✅ Test MT5 connection (if enabled)
4. ✅ Verify file structure
5. ✅ Check PHP installation (if MT5 enabled)

## If Variables Are Set in Deployment Platform

If you're using Railway, Vercel, AWS, or another platform:

1. **Variables are automatically available** - No `.env` file needed
2. **Run verification** - `npm run verify` will detect them
3. **Check platform dashboard** - Verify variables are set correctly

## Common Issues

### "Environment variable not found"
- Check deployment platform dashboard
- Verify variable name spelling
- Ensure variables are set for the correct environment (production/development)

### "Database connection failed"
- Verify `DATABASE_URL` format
- Check database is accessible
- For Railway: Check PostgreSQL service is running

### "MT5 connection failed"
- Verify `MT5_ENABLED=true`
- Check MT5 credentials are correct
- Ensure PHP is installed (for local testing)

## Next Steps

1. Run `npm run check-env` to see current status
2. Run `npm run verify` to test all connections
3. If issues found, check deployment platform environment variables
4. Start server: `npm run dev` or `npm start`

